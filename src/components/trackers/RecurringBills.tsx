/**
 * Tab 2 – Recurring Bills
 */
import { useState } from "react";
import { Plus, Trash2, Check, Calendar, Pencil } from "lucide-react";
import { Card, SectionHeader } from "../common/Card";
import { Button } from "../common/Button";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { CustomSelect } from "../common/CustomSelect";
import { useAppState } from "../../context/AppStateContext";
import { monthKey, formatCurrency } from "../../hooks/useAnalytics";
import { EXPENSE_CATEGORIES, type RecurringBill } from "../../types";

const blank = { name: "", amount: "", dueDay: "1", categoryId: "utilities" };

export function RecurringBills() {
  const { state, addBill, updateBill, deleteBill, toggleBillPaid } = useAppState();
  const mk = monthKey();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RecurringBill | null>(null);
  const [form, setForm] = useState({ ...blank });

  const bills = [...state.recurringBills].sort((a, b) => a.dueDay - b.dueDay);
  const monthlyTotal = bills.reduce((s, b) => s + b.amount, 0);
  const paidTotal = bills.filter((b) => b.paidMonths[mk]).reduce((s, b) => s + b.amount, 0);

  const openNew = () => {
    setEditing(null);
    setForm({ ...blank });
    setOpen(true);
  };

  const openEdit = (b: RecurringBill) => {
    setEditing(b);
    setForm({ name: b.name, amount: String(b.amount), dueDay: String(b.dueDay), categoryId: b.categoryId });
    setOpen(true);
  };

  const save = () => {
    const value = parseFloat(form.amount);
    const day = Math.min(Math.max(parseInt(form.dueDay, 10) || 1, 1), 31);
    if (!form.name.trim() || !value || value <= 0) return;
    if (editing) {
      updateBill({ ...editing, name: form.name.trim(), amount: value, dueDay: day, categoryId: form.categoryId });
    } else {
      addBill({ name: form.name.trim(), amount: value, dueDay: day, categoryId: form.categoryId });
    }
    setOpen(false);
  };

  const summary = [
    { label: "Monthly Bills Total", value: formatCurrency(monthlyTotal), cls: "text-white" },
    { label: "Paid This Month", value: formatCurrency(paidTotal), cls: "text-emerald-300" },
    { label: "Still Due", value: formatCurrency(monthlyTotal - paidTotal), cls: "text-amber-300" },
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
          title="Recurring Bills"
          subtitle="Check a bill off to log it instantly to your expenses"
          action={<Button onClick={openNew}><Plus size={16} /> Add Bill</Button>}
        />

        {bills.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No recurring bills yet.</p>
        ) : (
          <div className="space-y-1.5">
            {bills.map((b) => {
              const paid = !!b.paidMonths[mk];
              return (
                <div
                  key={b.id}
                  className={`group flex items-center gap-4 rounded-xl border px-4 py-3 transition-colors ${
                    paid ? "border-emerald-500/15 bg-emerald-500/[0.04]" : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                  }`}
                >
                  <button
                    onClick={() => toggleBillPaid(b, mk)}
                    className={`flex h-5 w-5 items-center justify-center rounded-md border transition-all ${
                      paid ? "border-emerald-400 bg-emerald-500 text-white" : "border-white/20 bg-transparent text-transparent hover:border-brand-400"
                    }`}
                    aria-label={paid ? "Mark unpaid" : "Mark paid"}
                  >
                    <Check size={13} strokeWidth={3} />
                  </button>

                  <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className={`truncate text-sm ${paid ? "text-slate-500 line-through" : "text-slate-200"}`}>{b.name}</p>
                      <p className="flex items-center gap-1 text-xs text-slate-500">
                        <Calendar size={11} /> Day {b.dueDay} · {EXPENSE_CATEGORIES.find((c) => c.id === b.categoryId)?.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="num text-sm text-slate-200">{formatCurrency(b.amount)}</span>
                      <div className="flex items-center gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                        <button onClick={() => openEdit(b)} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white" aria-label="Edit bill">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => deleteBill(b.id)} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-400" aria-label="Delete bill">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit Recurring Bill" : "Add Recurring Bill"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!form.name.trim() || !form.amount}>{editing ? "Save Changes" : "Save Bill"}</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Bill Name" className="sm:col-span-2" placeholder="e.g. Electricity" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
          <Input label="Amount" type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <Input label="Due Day (1-31)" type="number" min="1" max="31" value={form.dueDay} onChange={(e) => setForm({ ...form, dueDay: e.target.value })} />
          <CustomSelect label="Category" className="sm:col-span-2" value={form.categoryId} onChange={(v) => setForm({ ...form, categoryId: v })} options={EXPENSE_CATEGORIES.map((c) => ({ value: c.id, label: c.name }))} />
        </div>
      </Modal>
    </div>
  );
}
