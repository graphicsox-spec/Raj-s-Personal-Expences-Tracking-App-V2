import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Input, Field } from "./Input";
import { CustomSelect } from "./CustomSelect";
import { DatePicker } from "./DatePicker";
import { useAppState } from "../../context/AppStateContext";
import { CATEGORY_MAP, EXPENSE_CATEGORIES, type Transaction } from "../../types";

interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
  defaultCategoryId?: string;
  /** When provided, the modal edits this transaction instead of adding. */
  editing?: Transaction | null;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

export function AddExpenseModal({
  open,
  onClose,
  defaultCategoryId,
  editing,
}: AddExpenseModalProps) {
  const { addTransaction, updateTransaction } = useAppState();

  const [categoryId, setCategoryId] = useState(defaultCategoryId ?? "groceries");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setCategoryId(editing.categoryId);
      setSubCategoryId(editing.subCategoryId ?? "");
      setAmount(String(editing.amount));
      setDate(editing.date);
      setDescription(editing.description ?? "");
    } else {
      setCategoryId(defaultCategoryId ?? "groceries");
      setSubCategoryId("");
      setAmount("");
      setDate(todayISO());
      setDescription("");
    }
  }, [open, editing, defaultCategoryId]);

  const subCategories = CATEGORY_MAP[categoryId]?.subCategories ?? [];

  const submit = () => {
    const value = parseFloat(amount);
    if (!value || value <= 0) return;
    if (editing) {
      updateTransaction({
        ...editing,
        date,
        amount: value,
        categoryId,
        subCategoryId: subCategoryId || undefined,
        description: description.trim() || undefined,
      });
    } else {
      addTransaction({
        date,
        amount: value,
        categoryId,
        subCategoryId: subCategoryId || undefined,
        description: description.trim() || undefined,
      });
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit Expense" : "Add Expense"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={!amount || parseFloat(amount) <= 0}>
            {editing ? "Save Changes" : "Save Expense"}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Amount" type="number" min="0" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
        <DatePicker label="Date" value={date} onChange={setDate} />

        <CustomSelect
          label="Category"
          value={categoryId}
          onChange={(v) => { setCategoryId(v); setSubCategoryId(""); }}
          options={EXPENSE_CATEGORIES.map((c) => ({ value: c.id, label: c.name }))}
        />

        {subCategories.length > 0 ? (
          <CustomSelect
            label="Sub-category"
            value={subCategoryId}
            onChange={setSubCategoryId}
            placeholder="— none —"
            options={[{ value: "", label: "— none —" }, ...subCategories.map((s) => ({ value: s.id, label: s.name }))]}
          />
        ) : (
          <Field label="Sub-category">
            <div className="rounded-xl border border-dashed border-white/10 px-3 py-2 text-sm text-slate-500">None for this category</div>
          </Field>
        )}

        <Input label="Description (optional)" className="sm:col-span-2" placeholder="e.g. Costco run" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
    </Modal>
  );
}
