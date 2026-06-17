/**
 * useAnalytics – the single source of truth for every financial calculation
 * the dashboard and trackers need.
 */
import { useMemo } from "react";
import { useAppState } from "../context/AppStateContext";
import { EXPENSE_CATEGORIES, getCategoryName } from "../types";

export function monthKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCurrencyPrecise(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export interface CategorySpend {
  categoryId: string;
  name: string;
  amount: number;
}

export interface BudgetStatus {
  categoryId: string;
  name: string;
  limit: number;
  actual: number;
  remaining: number;
  percent: number;
  warning: boolean;
  over: boolean;
}

export interface MonthlyTrendPoint {
  month: string;
  monthKey: string;
  income: number;
  expenses: number;
}

export interface SubSpend {
  id: string;
  name: string;
  amount: number;
}

export interface CategorySubBreakdown {
  categoryId: string;
  name: string;
  total: number;
  subs: SubSpend[];
}

export interface Analytics {
  currentMonth: string;
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  savingsRate: number;
  creditCardBalances: number;
  creditCardLimit: number;
  mortgageUtilities: number;
  totalBudgeted: number;
  totalBudgetActual: number;
  remainingBudget: number;
  spendByCategory: CategorySpend[];
  topSpending: CategorySpend[];
  budgetStatuses: BudgetStatus[];
  monthlyTrend: MonthlyTrendPoint[];
  annualMonthlyTarget: number;
  subBreakdown: CategorySubBreakdown[];
}

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function useAnalytics(referenceDate: Date = new Date()): Analytics {
  const { state } = useAppState();

  return useMemo(() => {
    const currentMonth = monthKey(referenceDate);

    const totalIncome = state.incomeSources
      .filter((i) => i.date.startsWith(currentMonth))
      .reduce((sum, i) => sum + i.amount, 0);

    const monthTx = state.transactions.filter((t) => t.date.startsWith(currentMonth));
    const totalExpenses = monthTx.reduce((sum, t) => sum + t.amount, 0);

    const savings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

    const creditCardBalances = state.creditCards.reduce((s, c) => s + c.balance, 0);
    const creditCardLimit = state.creditCards.reduce((s, c) => s + c.creditLimit, 0);

    const mortgageUtilities = monthTx
      .filter((t) => t.categoryId === "mortgage" || t.categoryId === "utilities")
      .reduce((s, t) => s + t.amount, 0);

    const spendMap = new Map<string, number>();
    for (const t of monthTx) {
      spendMap.set(t.categoryId, (spendMap.get(t.categoryId) ?? 0) + t.amount);
    }
    const spendByCategory: CategorySpend[] = EXPENSE_CATEGORIES.map((c) => ({
      categoryId: c.id,
      name: c.name,
      amount: spendMap.get(c.id) ?? 0,
    }))
      .filter((c) => c.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    const topSpending = spendByCategory.slice(0, 5);

    const budgetStatuses: BudgetStatus[] = state.budgets
      .map((b) => {
        const actual = spendMap.get(b.categoryId) ?? 0;
        const percent = b.limit > 0 ? (actual / b.limit) * 100 : 0;
        return {
          categoryId: b.categoryId,
          name: getCategoryName(b.categoryId),
          limit: b.limit,
          actual,
          remaining: b.limit - actual,
          percent,
          warning: percent >= 90,
          over: percent > 100,
        };
      })
      .sort((a, b) => b.percent - a.percent);

    const totalBudgeted = state.budgets.reduce((s, b) => s + b.limit, 0);
    const totalBudgetActual = budgetStatuses.reduce((s, b) => s + b.actual, 0);
    const remainingBudget = totalBudgeted - totalBudgetActual;

    const monthlyTrend: MonthlyTrendPoint[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - i, 1);
      const key = monthKey(d);
      const income = state.incomeSources
        .filter((s) => s.date.startsWith(key))
        .reduce((sum, s) => sum + s.amount, 0);
      const expenses = state.transactions
        .filter((t) => t.date.startsWith(key))
        .reduce((sum, t) => sum + t.amount, 0);
      monthlyTrend.push({
        month: MONTH_LABELS[d.getMonth()],
        monthKey: key,
        income,
        expenses,
      });
    }

    const annualMonthlyTarget =
      state.annualExpenses.reduce((s, a) => s + a.amount, 0) / 12;

    // Per-sub-category breakdown for categories that have sub-categories and
    // recorded spend this month (e.g. Car Payment -> Raj vs Sharan).
    const subBreakdown: CategorySubBreakdown[] = [];
    for (const cat of EXPENSE_CATEGORIES) {
      if (!cat.subCategories) continue;
      const subs: SubSpend[] = cat.subCategories
        .map((sc) => ({
          id: sc.id,
          name: sc.name,
          amount: monthTx
            .filter((t) => t.categoryId === cat.id && t.subCategoryId === sc.id)
            .reduce((s, t) => s + t.amount, 0),
        }))
        .filter((s) => s.amount > 0);
      const total = subs.reduce((s, x) => s + x.amount, 0);
      if (total > 0) {
        subBreakdown.push({ categoryId: cat.id, name: cat.name, total, subs });
      }
    }

    return {
      currentMonth,
      totalIncome,
      totalExpenses,
      savings,
      savingsRate,
      creditCardBalances,
      creditCardLimit,
      mortgageUtilities,
      totalBudgeted,
      totalBudgetActual,
      remainingBudget,
      spendByCategory,
      topSpending,
      budgetStatuses,
      monthlyTrend,
      annualMonthlyTarget,
      subBreakdown,
    };
  }, [state, referenceDate]);
}
