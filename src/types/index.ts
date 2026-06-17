/**
 * Shared TypeScript contracts for the entire app.
 * Everything that touches money, categories, or persisted state is defined here.
 */

/* ------------------------------------------------------------------ */
/* Categories                                                          */
/* ------------------------------------------------------------------ */

export interface SubCategory {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  subCategories?: SubCategory[];
}

export const EXPENSE_CATEGORIES: Category[] = [
  { id: "mortgage", name: "Mortgage" },
  { id: "utilities", name: "Utilities" },
  { id: "groceries", name: "Groceries" },
  { id: "dining_out", name: "Dining Out" },
  { id: "gas", name: "Gas" },
  {
    id: "car_payment",
    name: "Car Payment",
    subCategories: [
      { id: "cp_raj", name: "Raj" },
      { id: "cp_sharan", name: "Sharan" },
    ],
  },
  {
    id: "insurance",
    name: "Insurance",
    subCategories: [
      { id: "ins_raj_car", name: "Raj Car Insurance" },
      { id: "ins_sharan_car", name: "Sharan Car Insurance" },
      { id: "ins_homeowners", name: "Homeowners Insurance" },
    ],
  },
  { id: "home_improvement", name: "Home Improvement" },
  { id: "samara", name: "Samara" }, // Dedicated Kids Category
  { id: "medical", name: "Medical" },
  { id: "travel", name: "Travel" },
  { id: "shopping", name: "Shopping" },
  {
    id: "subscriptions",
    name: "Subscriptions",
    subCategories: [
      { id: "sub_streaming", name: "Streaming (Netflix, Prime, etc.)" },
      { id: "sub_software", name: "Software/SaaS" },
      { id: "sub_other", name: "Other Subscriptions" },
    ],
  },
  { id: "entertainment", name: "Entertainment" },
  { id: "gym_fitness", name: "Gym/Fitness" },
  { id: "personal_care", name: "Personal Care" },
  { id: "miscellaneous", name: "Miscellaneous" },
  {
    id: "credit_cards",
    name: "Credit Cards",
    subCategories: [
      { id: "cc_card_1", name: "Primary Credit Card" },
      { id: "cc_card_2", name: "Secondary Credit Card" },
    ],
  },
];

/** Fast lookup helpers built from the source-of-truth array above. */
export const CATEGORY_MAP: Record<string, Category> = Object.fromEntries(
  EXPENSE_CATEGORIES.map((c) => [c.id, c])
);

export function getCategoryName(categoryId: string): string {
  return CATEGORY_MAP[categoryId]?.name ?? categoryId;
}

export function getSubCategoryName(
  categoryId: string,
  subCategoryId?: string
): string | undefined {
  if (!subCategoryId) return undefined;
  return CATEGORY_MAP[categoryId]?.subCategories?.find(
    (s) => s.id === subCategoryId
  )?.name;
}

/* ------------------------------------------------------------------ */
/* Transactions & income                                               */
/* ------------------------------------------------------------------ */

/** A single logged expense in the ledger. */
export interface Transaction {
  id: string;
  /** ISO date string, e.g. "2026-06-15" */
  date: string;
  amount: number;
  categoryId: string;
  subCategoryId?: string;
  description?: string;
  /** Optional link back to a recurring bill or credit card that generated it. */
  sourceBillId?: string;
  creditCardId?: string;
}

/** A source of cash inflow (salary, bonus, side income). */
export interface IncomeSource {
  id: string;
  name: string;
  amount: number;
  /** ISO date string for the month it applies to. */
  date: string;
}

/* ------------------------------------------------------------------ */
/* Budgets                                                             */
/* ------------------------------------------------------------------ */

/** A monthly spending cap allocated to a parent category. */
export interface Budget {
  categoryId: string;
  limit: number;
}

/* ------------------------------------------------------------------ */
/* Recurring bills                                                     */
/* ------------------------------------------------------------------ */

export interface RecurringBill {
  id: string;
  name: string;
  amount: number;
  /** Day of month the bill is due, 1-31. */
  dueDay: number;
  categoryId: string;
  subCategoryId?: string;
  /** Map of "YYYY-MM" -> true when paid that month. */
  paidMonths: Record<string, boolean>;
}

/* ------------------------------------------------------------------ */
/* Credit cards                                                        */
/* ------------------------------------------------------------------ */

export interface CreditCard {
  id: string;
  name: string;
  /** Manually-tracked starting/statement balance. */
  balance: number;
  creditLimit: number;
  /** Day of month payment is due, 1-31. */
  dueDay: number;
  /** Last 4 digits, purely cosmetic. */
  last4?: string;
  owner?: string;
}

/* ------------------------------------------------------------------ */
/* Home expenses (capital expenditure ledger)                          */
/* ------------------------------------------------------------------ */

export type HomeExpenseType =
  | "renovations"
  | "furniture_decor"
  | "structural_repairs";

export const HOME_EXPENSE_TYPES: { id: HomeExpenseType; name: string }[] = [
  { id: "renovations", name: "Renovations" },
  { id: "furniture_decor", name: "Furniture & Decor" },
  { id: "structural_repairs", name: "General Structural Repairs" },
];

export interface HomeExpense {
  id: string;
  type: HomeExpenseType;
  name: string;
  amount: number;
  date: string;
}

/* ------------------------------------------------------------------ */
/* Annual expenses (periodic large expenditures)                       */
/* ------------------------------------------------------------------ */

export interface AnnualExpense {
  id: string;
  name: string;
  /** Total amount due once per year. */
  amount: number;
  /** Month it is due, 1-12. */
  dueMonth: number;
  categoryId?: string;
}

/* ------------------------------------------------------------------ */
/* Root persisted state                                                */
/* ------------------------------------------------------------------ */

export interface AppState {
  incomeSources: IncomeSource[];
  transactions: Transaction[];
  budgets: Budget[];
  recurringBills: RecurringBill[];
  creditCards: CreditCard[];
  homeExpenses: HomeExpense[];
  annualExpenses: AnnualExpense[];
}

export type TabId =
  | "dashboard"
  | "transactions"
  | "budget"
  | "bills"
  | "cards"
  | "home"
  | "annual";
