/**
 * Tab 1 – Monthly Budget
 */
import { useState } from "react";
import { Plus, AlertTriangle, Trash2 } from "lucide-react";
import { Card, SectionHeader } from "../common/Card";
import { Button } from "../common/Button";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { CustomSelect } from "../common/CustomSelect";
import { ProgressBar } from "../common/ProgressBar";
import { useAppState } from "../../context/AppStateContext";
import { useAnalytics, formatCurrency } from "../../hooks/useAnalytics";
import { EXPENSE_CATEGORIES, getCategoryName } from "../../types";

export function BudgetTracker() {
  const { state, setBudget, deleteBudget } = useAppState();
  const { budgetStatuses, totalBudgeted, totalBudgetActual, remainingBudget } = useAnalytics();

  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState("groceries");
  const [limit, setLimit] = useState("");

  const budgetedIds = new Set(state.budgets.map((b) => b.categoryId));

  const save = () => {
    const value = parseFloat(limit);
    if (!value || value <= 0) return;
    setBudget({ categoryId, limit: value });
    setOpen(false);
    setLimit("");
  };

  const summary = [
    { label: "Total Budgeted", value: formatCurrency(totalBudgeted), cls: "text-white" },
    { label: "Spent So Far", value: formatCurrency(totalBudgetActual), cls: "text-amber-300" },
    { label: "Remaining", value: formatCurrency(remainingBudget), cls: remainingBudget < 0 ? "text-rose-300" : "text-emerald-300" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {summary.map((s, i) => (
          <Card key={s.label} className={`animate-fade-up delay-${i + 1}`}>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">{s.label}</p>
            <p className={`num mt-2 text-2xl font-bold ${s.cls}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      <Card className="animate-fade-up delay-3">
        <SectionHeader
          title="Category Budgets"
          subtitle="Budgeted vs actual spend for the current month"
          action={<Button onClick={() => setOpen(true)}><Plus size={16} /> Set Budget</Button>}
        />

        {budgetStatuses.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No budgets set yet. Click “Set Budget” to allocate a cap.</p>
        ) : (
          <div className="space-y-5">
            {budgetStatuses.map((b) => (
              <div key={b.categoryId}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300">{b.name}</span>
                    {b.over && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[11px] font-medium text-rose-300">
                        <AlertTriangle size={11} /> Over
                      </span>
                    )}
                    {b.warning && !b.over && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-300">
                        <AlertTriangle size={11} /> Near limit
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="num text-slate-400">{formatCurrency(b.actual)} / {formatCurrency(b.limit)}</span>
                    <button onClick={() => deleteBudget(b.categoryId)} className="text-slate-500 transition-colors hover:text-rose-400" aria-label="Remove budget">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <ProgressBar percent={b.percent} />
                <p className="num mt-1 text-xs text-slate-500">
                  {b.percent.toFixed(0)}% used ·{" "}
                  {b.remaining >= 0 ? `${formatCurrency(b.remaining)} left` : `${formatCurrency(Math.abs(b.remaining))} over`}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Set Category Budget"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!limit || parseFloat(limit) <= 0}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <CustomSelect
            label="Category"
            value={categoryId}
            onChange={setCategoryId}
            options={EXPENSE_CATEGORIES.map((c) => ({ value: c.id, label: `${c.name}${budgetedIds.has(c.id) ? " (update)" : ""}` }))}
          />
          <Input label="Monthly Limit" type="number" min="0" step="0.01" placeholder="e.g. 500" value={limit} onChange={(e) => setLimit(e.target.value)} autoFocus />
          <p className="text-xs text-slate-500">Setting a budget for {getCategoryName(categoryId)} caps its monthly spend. Bars turn red past 100%.</p>
        </div>
      </Modal>
    </div>
  );
}
