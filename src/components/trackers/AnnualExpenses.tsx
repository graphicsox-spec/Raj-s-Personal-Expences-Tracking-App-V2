/**
 * Tab 5 – Annual Expenses
 */
import { useState } from "react";
import { Plus, Trash2, PiggyBank } from "lucide-react";
import { Card, SectionHeader } from "../common/Card";
import { Button } from "../common/Button";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { CustomSelect } from "../common/CustomSelect";
import { useAppState } from "../../context/AppStateContext";
import { formatCurrency, formatCurrencyPrecise } from "../../hooks/useAnalytics";
import { EXPENSE_CATEGORIES } from "../../types";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function AnnualExpenses() {
  const { state, addAnnualExpense, deleteAnnualExpense } = useAppState();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueMonth, setDueMonth] = useState("1");
  const [categoryId, setCategoryId] = useState("");

  const items = [...state.annualExpenses].sort((a, b) => a.dueMonth - b.dueMonth);
  const annualTotal = items.reduce((s, e) => s + e.amount, 0);
  const monthlyTarget = annualTotal / 12;

  const save = () => {
    const value = parseFloat(amount);
    if (!name.trim() || !value || value <= 0) return;
    addAnnualExpense({ name: name.trim(), amount: value, dueMonth: parseInt(dueMonth, 10), categoryId: categoryId || undefined });
    setOpen(false);
    setName("");
    setAmount("");
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="animate-fade-up delay-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Total Annual Obligations</p>
          <p className="num mt-2 text-3xl font-bold text-white">{formatCurrency(annualTotal)}</p>
        </Card>
        <Card className="animate-fade-up delay-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Set Aside Each Month</p>
              <p className="num mt-2 text-3xl font-bold text-gradient">{formatCurrencyPrecise(monthlyTarget)}</p>
              <p className="mt-1 text-xs text-slate-500">Prorated savings target across all annual expenses</p>
            </div>
            <PiggyBank size={20} className="text-brand-300" />
          </div>
        </Card>
      </div>

      <Card className="animate-fade-up delay-3">
        <SectionHeader
          title="Annual Expense Plan"
          subtitle="Each row shows what to save monthly to be ready when it's due"
          action={<Button onClick={() => setOpen(true)}><Plus size={16} /> Add Annual Expense</Button>}
        />

        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No annual expenses planned yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="py-2 pr-4 font-medium">Expense</th>
                  <th className="py-2 pr-4 font-medium">Due</th>
                  <th className="py-2 pr-4 text-right font-medium">Annual</th>
                  <th className="py-2 pr-4 text-right font-medium">Monthly Target</th>
                  <th className="py-2 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {items.map((e) => (
                  <tr key={e.id} className="text-slate-200">
                    <td className="py-3 pr-4">{e.name}</td>
                    <td className="py-3 pr-4 text-slate-400">{MONTHS[e.dueMonth - 1]}</td>
                    <td className="num py-3 pr-4 text-right">{formatCurrency(e.amount)}</td>
                    <td className="num py-3 pr-4 text-right font-semibold text-brand-300">{formatCurrencyPrecise(e.amount / 12)}</td>
                    <td className="py-3 text-right">
                      <button onClick={() => deleteAnnualExpense(e.id)} className="text-slate-500 transition-colors hover:text-rose-400" aria-label="Delete">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add Annual Expense"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!name.trim() || !amount}>Save</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Expense Name" className="sm:col-span-2" placeholder="e.g. Property Tax" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          <Input label="Annual Amount" type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <CustomSelect label="Due Month" value={dueMonth} onChange={setDueMonth} options={MONTHS.map((m, i) => ({ value: String(i + 1), label: m }))} />
          <CustomSelect label="Category (optional)" className="sm:col-span-2" value={categoryId} onChange={setCategoryId} placeholder="— none —" options={[{ value: "", label: "— none —" }, ...EXPENSE_CATEGORIES.map((c) => ({ value: c.id, label: c.name }))]} />
        </div>
      </Modal>
    </div>
  );
}
