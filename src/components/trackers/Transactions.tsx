/**
 * Transactions – the full ledger. View, filter, edit & delete every expense.
 */
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Receipt } from "lucide-react";
import { Card, SectionHeader } from "../common/Card";
import { Button } from "../common/Button";
import { CustomSelect } from "../common/CustomSelect";
import { AddExpenseModal } from "../common/AddExpenseModal";
import { useAppState } from "../../context/AppStateContext";
import { formatCurrency } from "../../hooks/useAnalytics";
import {
  EXPENSE_CATEGORIES,
  getCategoryName,
  getSubCategoryName,
  type Transaction,
} from "../../types";

function prettyDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y) return iso;
  return new Date(y, (m || 1) - 1, d || 1).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function Transactions() {
  const { state, deleteTransaction } = useAppState();
  const [cat, setCat] = useState("all");
  const [month, setMonth] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  // Distinct months present in the data, newest first.
  const months = useMemo(() => {
    const set = new Set(state.transactions.map((t) => t.date.slice(0, 7)));
    return [...set].sort().reverse();
  }, [state.transactions]);

  const rows = useMemo(() => {
    return state.transactions
      .filter((t) => (cat === "all" ? true : t.categoryId === cat))
      .filter((t) => (month === "all" ? true : t.date.startsWith(month)))
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }, [state.transactions, cat, month]);

  const total = rows.reduce((s, t) => s + t.amount, 0);

  const monthLabel = (m: string) => {
    const [y, mo] = m.split("-").map(Number);
    return new Date(y, mo - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="animate-fade-up delay-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Entries Shown</p>
          <p className="num mt-2 text-2xl font-bold text-white">{rows.length}</p>
        </Card>
        <Card className="animate-fade-up delay-2">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Total (filtered)</p>
          <p className="num mt-2 text-2xl font-bold text-rose-300">{formatCurrency(total)}</p>
        </Card>
        <Card className="animate-fade-up delay-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">All-time Entries</p>
          <p className="num mt-2 text-2xl font-bold text-slate-200">{state.transactions.length}</p>
        </Card>
      </div>

      <Card className="animate-fade-up delay-3">
        <SectionHeader
          title="All Expenses"
          subtitle="View, edit or delete any logged expense"
          action={
            <Button onClick={() => { setEditing(null); setAddOpen(true); }}>
              <Plus size={16} /> Add Expense
            </Button>
          }
        />

        {/* Filters */}
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <CustomSelect
            value={cat}
            onChange={setCat}
            options={[{ value: "all", label: "All categories" }, ...EXPENSE_CATEGORIES.map((c) => ({ value: c.id, label: c.name }))]}
          />
          <CustomSelect
            value={month}
            onChange={setMonth}
            options={[{ value: "all", label: "All months" }, ...months.map((m) => ({ value: m, label: monthLabel(m) }))]}
          />
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <Receipt size={26} className="text-slate-600" />
            <p className="text-sm text-slate-500">No expenses match this filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {rows.map((t) => {
              const sub = getSubCategoryName(t.categoryId, t.subCategoryId);
              return (
                <div key={t.id} className="group flex items-center gap-3 py-3">
                  <div className="num w-20 shrink-0 text-xs text-slate-500">{prettyDate(t.date)}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-slate-200">
                      {t.description || getCategoryName(t.categoryId)}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {getCategoryName(t.categoryId)}
                      {sub ? ` · ${sub}` : ""}
                    </p>
                  </div>
                  <span className="num shrink-0 text-sm font-semibold text-slate-100">
                    {formatCurrency(t.amount)}
                  </span>
                  <div className="flex shrink-0 items-center gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => { setEditing(t); setAddOpen(true); }}
                      className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                      aria-label="Edit expense"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => deleteTransaction(t.id)}
                      className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                      aria-label="Delete expense"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <AddExpenseModal open={addOpen} onClose={() => setAddOpen(false)} editing={editing} />
    </div>
  );
}
