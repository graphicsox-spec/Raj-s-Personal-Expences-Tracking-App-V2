import type { TabId } from "../../types";
import { Button } from "./Button";
import { GlobalSearch } from "./GlobalSearch";
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

interface TopBarProps {
  active: TabId;
  onMenuClick: () => void;
  onAddExpense: () => void;
  onNavigate: (tab: TabId) => void;
}

export function TopBar({ active, onMenuClick, onAddExpense, onNavigate }: TopBarProps) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/[0.06] bg-[#08090d]/70 px-4 py-4 backdrop-blur-xl lg:px-8">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-slate-300 hover:bg-white/5 lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="min-w-0 shrink-0">
        <h1 className="truncate text-xl font-bold tracking-tight text-white">{TITLES[active]}</h1>
      </div>

      <div className="hidden flex-1 justify-end md:flex">
        <GlobalSearch onNavigate={onNavigate} />
      </div>
      <div className="flex-1 md:hidden" />

      <div className="flex shrink-0 items-center gap-3">
        <span className="num hidden text-xs text-slate-500 sm:block">{today}</span>
        <Button onClick={onAddExpense}>
          <Plus size={16} /> <span className="hidden sm:inline">Add Expense</span>
        </Button>
      </div>
    </header>
  );
}
