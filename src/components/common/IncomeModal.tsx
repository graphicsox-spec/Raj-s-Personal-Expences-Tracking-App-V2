import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Input } from "./Input";
import { useAppState } from "../../context/AppStateContext";
import { monthKey, formatCurrency } from "../../hooks/useAnalytics";

interface IncomeModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Manage the current month's income sources (cash inflows that feed the
 * "Total Monthly Income" metric). Add, rename, re-value, or delete entries.
 */
export function IncomeModal({ open, onClose }: IncomeModalProps) {
  const { state, addIncome, updateIncome, deleteIncome } = useAppState();
  const mk = monthKey();
  const monthStart = `${mk}-01`;

  const sources = state.incomeSources.filter((i) => i.date.startsWith(mk));
  const total = sources.reduce((s, i) => s + i.amount, 0);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  const add = () => {
    const v = parseFloat(amount);
    if (!name.trim() || !v || v <= 0) return;
    addIncome({ name: name.trim(), amount: v, date: monthStart });
    setName("");
    setAmount("");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Manage Monthly Income"
      footer={<Button onClick={onClose}>Done</Button>}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 px-4 py-3">
          <span className="text-sm text-slate-300">Total this month</span>
          <span className="text-xl font-extrabold text-emerald-300">
            {formatCurrency(total)}
          </span>
        </div>

        {sources.length > 0 && (
          <div className="space-y-2">
            {sources.map((i) => (
              <div
                key={i.id}
                className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2"
              >
                <input
                  value={i.name}
                  onChange={(e) => updateIncome({ ...i, name: e.target.value })}
                  className="min-w-0 flex-1 rounded-lg bg-transparent px-1 text-sm text-slate-200 focus:bg-white/[0.04] focus:outline-none"
                  aria-label="Income name"
                />
                <div className="flex items-center gap-1 text-sm text-slate-300">
                  <span className="text-slate-500">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={i.amount}
                    onChange={(e) =>
                      updateIncome({ ...i, amount: parseFloat(e.target.value) || 0 })
                    }
                    className="w-24 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-right text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500/40"
                    aria-label="Income amount"
                  />
                </div>
                <button
                  onClick={() => deleteIncome(i.id)}
                  className="text-slate-500 transition-colors hover:text-rose-400"
                  aria-label="Delete income source"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-xl border border-dashed border-white/10 p-3">
          <p className="mb-2 text-xs font-medium text-slate-400">Add income source</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="e.g. Salary, Bonus, Freelance"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1"
            />
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="sm:w-36"
            />
            <Button onClick={add} disabled={!name.trim() || !amount}>
              <Plus size={16} /> Add
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
