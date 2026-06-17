import type { TabId } from "../../types";
import { Button } from "./Button";
import { Menu, Plus } from "lucide-react";

const TITLES: Record<TabId, string> = {
  dashboard: "Dashboard",
  transactions: "Transactions",
  budget: "Monthly Budget",
  bills: "Recurring Bills",
  cards: "Credit Cards",
  home: "Home Expenses",
  annual: "Annual Expenses",
};

interface NavbarProps {
  active: TabId;
  onMenuClick: () => void;
  onAddExpense: () => void;
}

export function Navbar({ active, onMenuClick, onAddExpense }: NavbarProps) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-ink-900/60 px-4 py-3 backdrop-blur-xl lg:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-300 hover:bg-white/10 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white">
            {TITLES[active]}
          </h1>
          <p className="hidden text-xs text-slate-500 sm:block">{today}</p>
        </div>
      </div>

      <Button onClick={onAddExpense}>
        <Plus size={16} /> Add Expense
      </Button>
    </header>
  );
}
