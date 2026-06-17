/**
 * Tab 4 – Home Expenses
 */
import { useState } from "react";
import { Plus, Hammer, Sofa, Wrench, Home, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { CustomSelect } from "../common/CustomSelect";
import { DatePicker } from "../common/DatePicker";
import { useAppState } from "../../context/AppStateContext";
import { formatCurrency } from "../../hooks/useAnalytics";
import { HOME_EXPENSE_TYPES, type HomeExpenseType } from "../../types";

const todayISO = () => new Date().toISOString().slice(0, 10);

const PANEL_META: Record<HomeExpenseType, { icon: LucideIcon; accent: string }> = {
  renovations: { icon: Hammer, accent: "text-brand-300" },
  furniture_decor: { icon: Sofa, accent: "text-emerald-300" },
  structural_repairs: { icon: Wrench, accent: "text-amber-300" },
};

export function HomeExpenses() {
  const { state, addHomeExpense, deleteHomeExpense } = useAppState();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<HomeExpenseType>("renovations");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());

  const grandTotal = state.homeExpenses.reduce((s, e) => s + e.amount, 0);

  const openNew = (t: HomeExpenseType) => {
    setType(t);
    setName("");
    setAmount("");
    setDate(todayISO());
    setOpen(true);
  };

  const save = () => {
    const value = parseFloat(amount);
    if (!name.trim() || !value || value <= 0) return;
    addHomeExpense({ type, name: name.trim(), amount: value, date });
    setOpen(false);
  };

  return (
    <div className="space-y-5">
      <Card className="animate-fade-up delay-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Total Invested in the Home</p>
            <p className="num mt-2 text-3xl font-bold text-gradient">{formatCurrency(grandTotal)}</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
            <Home size={20} className="text-brand-300" />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {HOME_EXPENSE_TYPES.map((panel, idx) => {
          const items = state.homeExpenses.filter((e) => e.type === panel.id);
          const subtotal = items.reduce((s, e) => s + e.amount, 0);
          const meta = PANEL_META[panel.id];
          const Icon = meta.icon;
          return (
            <Card key={panel.id} className={`flex flex-col animate-fade-up delay-${idx + 2}`}>
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
                    <Icon size={18} className={meta.accent} />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-white">{panel.name}</h2>
                    <p className="text-xs text-slate-500">{items.length} item{items.length === 1 ? "" : "s"}</p>
                  </div>
                </div>
                <Button size="sm" variant="secondary" onClick={() => openNew(panel.id)}>
                  <Plus size={14} />
                </Button>
              </div>

              <p className={`num mb-4 text-2xl font-bold ${meta.accent}`}>{formatCurrency(subtotal)}</p>

              {items.length === 0 ? (
                <p className="flex-1 py-6 text-center text-sm text-slate-500">Nothing logged yet.</p>
              ) : (
                <ul className="flex-1 space-y-1.5">
                  {items.map((e) => (
                    <li key={e.id} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm">
                      <div className="min-w-0">
                        <p className="truncate text-slate-200">{e.name}</p>
                        <p className="num text-xs text-slate-500">{e.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="num text-slate-200">{formatCurrency(e.amount)}</span>
                        <button onClick={() => deleteHomeExpense(e.id)} className="text-slate-500 transition-colors hover:text-rose-400" aria-label="Delete">
                          <X size={15} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          );
        })}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add Home Expense"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!name.trim() || !amount}>Save</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CustomSelect label="Panel" className="sm:col-span-2" value={type} onChange={(v) => setType(v as HomeExpenseType)} options={HOME_EXPENSE_TYPES.map((t) => ({ value: t.id, label: t.name }))} />
          <Input label="Item Name" className="sm:col-span-2" placeholder="e.g. Kitchen cabinets" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          <Input label="Amount" type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <DatePicker label="Date" value={date} onChange={setDate} />
        </div>
      </Modal>
    </div>
  );
}
