/**
 * Global application state.
 *
 * Holds income, transactions, budgets, bills, cards, home & annual expenses,
 * exposes CRUD actions for each, and transparently persists everything to
 * localStorage so the data survives page refreshes.
 */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type {
  AnnualExpense,
  AppState,
  Budget,
  CreditCard,
  HomeExpense,
  IncomeSource,
  RecurringBill,
  Transaction,
} from "../types";

/* ------------------------------------------------------------------ */
/* Persistence                                                         */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = "raj-expense-tracker:v2";

/** Small id helper – good enough for a single-user local app. */
export const uid = (): string =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

/** Seed data so the dashboard isn't empty on first launch. */
function seedState(): AppState {
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const d = (day: number) => `${ym}-${String(day).padStart(2, "0")}`;

  return {
    incomeSources: [
      { id: uid(), name: "Raj – Salary", amount: 7200, date: d(1) },
      { id: uid(), name: "Sharan – Salary", amount: 5400, date: d(1) },
    ],
    transactions: [
      { id: uid(), date: d(2), amount: 2450, categoryId: "mortgage", description: "Monthly mortgage" },
      { id: uid(), date: d(3), amount: 280, categoryId: "utilities", description: "Electric + water" },
      { id: uid(), date: d(5), amount: 640, categoryId: "groceries", description: "Costco + grocery runs" },
      { id: uid(), date: d(7), amount: 210, categoryId: "dining_out", description: "Restaurants" },
      { id: uid(), date: d(8), amount: 160, categoryId: "gas", description: "Fuel" },
      { id: uid(), date: d(9), amount: 540, categoryId: "car_payment", subCategoryId: "cp_raj", description: "Raj car payment" },
      { id: uid(), date: d(9), amount: 480, categoryId: "car_payment", subCategoryId: "cp_sharan", description: "Sharan car payment" },
      { id: uid(), date: d(10), amount: 320, categoryId: "samara", description: "Daycare + supplies" },
      { id: uid(), date: d(12), amount: 95, categoryId: "subscriptions", subCategoryId: "sub_streaming", description: "Streaming bundle" },
      { id: uid(), date: d(13), amount: 130, categoryId: "shopping", description: "Household items" },
    ],
    budgets: [
      { categoryId: "groceries", limit: 800 },
      { categoryId: "dining_out", limit: 300 },
      { categoryId: "gas", limit: 250 },
      { categoryId: "samara", limit: 500 },
      { categoryId: "shopping", limit: 300 },
      { categoryId: "entertainment", limit: 200 },
    ],
    recurringBills: [
      { id: uid(), name: "Electricity", amount: 180, dueDay: 5, categoryId: "utilities", paidMonths: {} },
      { id: uid(), name: "Water", amount: 70, dueDay: 8, categoryId: "utilities", paidMonths: {} },
      { id: uid(), name: "Internet", amount: 85, dueDay: 12, categoryId: "utilities", paidMonths: {} },
      { id: uid(), name: "Netflix + Prime", amount: 45, dueDay: 15, categoryId: "subscriptions", subCategoryId: "sub_streaming", paidMonths: {} },
    ],
    creditCards: [
      { id: "cc_card_1", name: "Primary Credit Card", balance: 1840, creditLimit: 12000, dueDay: 18, last4: "4821" },
      { id: "cc_card_2", name: "Secondary Credit Card", balance: 620, creditLimit: 6000, dueDay: 25, last4: "7193" },
    ],
    homeExpenses: [
      { id: uid(), type: "renovations", name: "Kitchen backsplash", amount: 1850, date: d(4) },
      { id: uid(), type: "furniture_decor", name: "Living room sofa", amount: 2200, date: d(6) },
      { id: uid(), type: "structural_repairs", name: "Roof gutter fix", amount: 480, date: d(11) },
    ],
    annualExpenses: [
      { id: uid(), name: "Property Tax", amount: 7800, dueMonth: 11, categoryId: "mortgage" },
      { id: uid(), name: "Family Vacation", amount: 6000, dueMonth: 7, categoryId: "travel" },
      { id: uid(), name: "Homeowners Insurance", amount: 1800, dueMonth: 9, categoryId: "insurance" },
    ],
  };
}

const emptyState: AppState = {
  incomeSources: [],
  transactions: [],
  budgets: [],
  recurringBills: [],
  creditCards: [],
  homeExpenses: [],
  annualExpenses: [],
};

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    // Merge with empty state so newly-added slices never come back undefined.
    return { ...emptyState, ...parsed };
  } catch {
    return seedState();
  }
}

/* ------------------------------------------------------------------ */
/* Reducer                                                             */
/* ------------------------------------------------------------------ */

type Action =
  // Income
  | { type: "ADD_INCOME"; payload: IncomeSource }
  | { type: "UPDATE_INCOME"; payload: IncomeSource }
  | { type: "DELETE_INCOME"; payload: string }
  // Transactions
  | { type: "ADD_TRANSACTION"; payload: Transaction }
  | { type: "UPDATE_TRANSACTION"; payload: Transaction }
  | { type: "DELETE_TRANSACTION"; payload: string }
  // Budgets
  | { type: "SET_BUDGET"; payload: Budget }
  | { type: "DELETE_BUDGET"; payload: string }
  // Recurring bills
  | { type: "ADD_BILL"; payload: RecurringBill }
  | { type: "UPDATE_BILL"; payload: RecurringBill }
  | { type: "DELETE_BILL"; payload: string }
  // Credit cards
  | { type: "ADD_CARD"; payload: CreditCard }
  | { type: "UPDATE_CARD"; payload: CreditCard }
  | { type: "DELETE_CARD"; payload: string }
  // Home expenses
  | { type: "ADD_HOME"; payload: HomeExpense }
  | { type: "UPDATE_HOME"; payload: HomeExpense }
  | { type: "DELETE_HOME"; payload: string }
  // Annual expenses
  | { type: "ADD_ANNUAL"; payload: AnnualExpense }
  | { type: "UPDATE_ANNUAL"; payload: AnnualExpense }
  | { type: "DELETE_ANNUAL"; payload: string }
  // Bulk
  | { type: "RESET"; payload: AppState };

function upsert<T extends { id: string }>(list: T[], item: T): T[] {
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx === -1) return [...list, item];
  const copy = [...list];
  copy[idx] = item;
  return copy;
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    // Income
    case "ADD_INCOME":
    case "UPDATE_INCOME":
      return { ...state, incomeSources: upsert(state.incomeSources, action.payload) };
    case "DELETE_INCOME":
      return { ...state, incomeSources: state.incomeSources.filter((x) => x.id !== action.payload) };

    // Transactions
    case "ADD_TRANSACTION":
    case "UPDATE_TRANSACTION":
      return { ...state, transactions: upsert(state.transactions, action.payload) };
    case "DELETE_TRANSACTION":
      return { ...state, transactions: state.transactions.filter((x) => x.id !== action.payload) };

    // Budgets (keyed by categoryId, one per category)
    case "SET_BUDGET": {
      const others = state.budgets.filter((b) => b.categoryId !== action.payload.categoryId);
      return { ...state, budgets: [...others, action.payload] };
    }
    case "DELETE_BUDGET":
      return { ...state, budgets: state.budgets.filter((b) => b.categoryId !== action.payload) };

    // Bills
    case "ADD_BILL":
    case "UPDATE_BILL":
      return { ...state, recurringBills: upsert(state.recurringBills, action.payload) };
    case "DELETE_BILL":
      return { ...state, recurringBills: state.recurringBills.filter((x) => x.id !== action.payload) };

    // Cards
    case "ADD_CARD":
    case "UPDATE_CARD":
      return { ...state, creditCards: upsert(state.creditCards, action.payload) };
    case "DELETE_CARD":
      return { ...state, creditCards: state.creditCards.filter((x) => x.id !== action.payload) };

    // Home
    case "ADD_HOME":
    case "UPDATE_HOME":
      return { ...state, homeExpenses: upsert(state.homeExpenses, action.payload) };
    case "DELETE_HOME":
      return { ...state, homeExpenses: state.homeExpenses.filter((x) => x.id !== action.payload) };

    // Annual
    case "ADD_ANNUAL":
    case "UPDATE_ANNUAL":
      return { ...state, annualExpenses: upsert(state.annualExpenses, action.payload) };
    case "DELETE_ANNUAL":
      return { ...state, annualExpenses: state.annualExpenses.filter((x) => x.id !== action.payload) };

    case "RESET":
      return action.payload;

    default:
      return state;
  }
}

/* ------------------------------------------------------------------ */
/* Context shape                                                       */
/* ------------------------------------------------------------------ */

interface AppStateContextValue {
  state: AppState;
  // Income
  addIncome: (i: Omit<IncomeSource, "id">) => void;
  updateIncome: (i: IncomeSource) => void;
  deleteIncome: (id: string) => void;
  // Transactions
  addTransaction: (t: Omit<Transaction, "id">) => void;
  updateTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  // Budgets
  setBudget: (b: Budget) => void;
  deleteBudget: (categoryId: string) => void;
  // Bills
  addBill: (b: Omit<RecurringBill, "id" | "paidMonths">) => void;
  updateBill: (b: RecurringBill) => void;
  deleteBill: (id: string) => void;
  /** Toggle a bill paid for a given "YYYY-MM"; logs/removes a matching transaction. */
  toggleBillPaid: (bill: RecurringBill, monthKey: string) => void;
  // Cards
  addCard: (c: Omit<CreditCard, "id">) => void;
  updateCard: (c: CreditCard) => void;
  deleteCard: (id: string) => void;
  // Home
  addHomeExpense: (h: Omit<HomeExpense, "id">) => void;
  updateHomeExpense: (h: HomeExpense) => void;
  deleteHomeExpense: (id: string) => void;
  // Annual
  addAnnualExpense: (a: Omit<AnnualExpense, "id">) => void;
  updateAnnualExpense: (a: AnnualExpense) => void;
  deleteAnnualExpense: (id: string) => void;
  // Bulk
  resetAll: () => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  // Persist on every change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full / unavailable – fail silently for a local app.
    }
  }, [state]);

  const value = useMemo<AppStateContextValue>(() => {
    return {
      state,

      // Income
      addIncome: (i) => dispatch({ type: "ADD_INCOME", payload: { ...i, id: uid() } }),
      updateIncome: (i) => dispatch({ type: "UPDATE_INCOME", payload: i }),
      deleteIncome: (id) => dispatch({ type: "DELETE_INCOME", payload: id }),

      // Transactions
      addTransaction: (t) => dispatch({ type: "ADD_TRANSACTION", payload: { ...t, id: uid() } }),
      updateTransaction: (t) => dispatch({ type: "UPDATE_TRANSACTION", payload: t }),
      deleteTransaction: (id) => dispatch({ type: "DELETE_TRANSACTION", payload: id }),

      // Budgets
      setBudget: (b) => dispatch({ type: "SET_BUDGET", payload: b }),
      deleteBudget: (categoryId) => dispatch({ type: "DELETE_BUDGET", payload: categoryId }),

      // Bills
      addBill: (b) =>
        dispatch({ type: "ADD_BILL", payload: { ...b, id: uid(), paidMonths: {} } }),
      updateBill: (b) => dispatch({ type: "UPDATE_BILL", payload: b }),
      deleteBill: (id) => dispatch({ type: "DELETE_BILL", payload: id }),
      toggleBillPaid: (bill, monthKey) => {
        const isPaid = !!bill.paidMonths[monthKey];
        const updated: RecurringBill = {
          ...bill,
          paidMonths: { ...bill.paidMonths, [monthKey]: !isPaid },
        };
        dispatch({ type: "UPDATE_BILL", payload: updated });

        if (!isPaid) {
          // Newly paid -> log an expense to the ledger.
          dispatch({
            type: "ADD_TRANSACTION",
            payload: {
              id: uid(),
              date: `${monthKey}-${String(bill.dueDay).padStart(2, "0")}`,
              amount: bill.amount,
              categoryId: bill.categoryId,
              subCategoryId: bill.subCategoryId,
              description: `${bill.name} (auto-logged bill)`,
              sourceBillId: bill.id,
            },
          });
        } else {
          // Un-paid -> remove the auto-logged expense for that month.
          const match = state.transactions.find(
            (t) => t.sourceBillId === bill.id && t.date.startsWith(monthKey)
          );
          if (match) dispatch({ type: "DELETE_TRANSACTION", payload: match.id });
        }
      },

      // Cards
      addCard: (c) => dispatch({ type: "ADD_CARD", payload: { ...c, id: uid() } }),
      updateCard: (c) => dispatch({ type: "UPDATE_CARD", payload: c }),
      deleteCard: (id) => dispatch({ type: "DELETE_CARD", payload: id }),

      // Home
      addHomeExpense: (h) => dispatch({ type: "ADD_HOME", payload: { ...h, id: uid() } }),
      updateHomeExpense: (h) => dispatch({ type: "UPDATE_HOME", payload: h }),
      deleteHomeExpense: (id) => dispatch({ type: "DELETE_HOME", payload: id }),

      // Annual
      addAnnualExpense: (a) => dispatch({ type: "ADD_ANNUAL", payload: { ...a, id: uid() } }),
      updateAnnualExpense: (a) => dispatch({ type: "UPDATE_ANNUAL", payload: a }),
      deleteAnnualExpense: (id) => dispatch({ type: "DELETE_ANNUAL", payload: id }),

      // Bulk
      resetAll: () => dispatch({ type: "RESET", payload: seedState() }),
    };
  }, [state]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

/* ------------------------------------------------------------------ */
/* Hook                                                                */
/* ------------------------------------------------------------------ */

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within an AppStateProvider");
  return ctx;
}
