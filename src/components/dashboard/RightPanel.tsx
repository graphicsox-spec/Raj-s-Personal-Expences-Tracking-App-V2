import type { ReactNode } from "react";
import { Repeat, CreditCard, CalendarDays, CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAppState } from "../../context/AppStateContext";
import { monthKey, formatCurrency } from "../../hooks/useAnalytics";
import type { TabId } from "../../types";

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

interface RightPanelProps {
  onNavigate: (tab: TabId) => void;
}

function PanelCard({
  title,
  icon: Icon,
  onClick,
  children,
}: {
  title: string;
  icon: LucideIcon;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <div className="glass p-4 shadow-card">
      <button
        onClick={onClick}
        className="mb-3 flex w-full items-center justify-between text-left"
      >
        <span className="flex items-center gap-2 text-sm font-bold text-white">
          <Icon size={15} className="text-brand-300" /> {title}
        </span>
        <span className="text-xs font-medium text-brand-300 hover:text-brand-200">View</span>
      </button>
      {children}
    </div>
  );
}

export function RightPanel({ onNavigate }: RightPanelProps) {
  const { state } = useAppState();
  const mk = monthKey();
  const now = new Date();
  const thisMonth = now.getMonth() + 1;

  const upcomingBills = [...state.recurringBills]
    .filter((b) => !b.paidMonths[mk])
    .sort((a, b) => a.dueDay - b.dueDay)
    .slice(0, 4);

  const cards = [...state.creditCards].sort((a, b) => a.dueDay - b.dueDay).slice(0, 3);

  const annualSoon = [...state.annualExpenses]
    .map((a) => ({ ...a, monthsAway: (a.dueMonth - thisMonth + 12) % 12 }))
    .sort((a, b) => a.monthsAway - b.monthsAway)
    .slice(0, 3);

  return (
    <aside className="space-y-4">
      <PanelCard title="Upcoming Bills" icon={Repeat} onClick={() => onNavigate("bills")}>
        {upcomingBills.length === 0 ? (
          <p className="flex items-center gap-2 py-2 text-sm text-slate-400">
            <CheckCircle2 size={15} className="text-emerald-400" /> All bills paid this month.
          </p>
        ) : (
          <ul className="space-y-2">
            {upcomingBills.map((b) => (
              <li key={b.id} className="flex items-center justify-between text-sm">
                <span className="min-w-0">
                  <span className="block truncate text-slate-200">{b.name}</span>
                  <span className="text-xs text-slate-500">Due day {b.dueDay}</span>
                </span>
                <span className="font-semibold text-slate-200">{formatCurrency(b.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </PanelCard>

      <PanelCard title="Cards & Due Dates" icon={CreditCard} onClick={() => onNavigate("cards")}>
        {cards.length === 0 ? (
          <p className="py-2 text-sm text-slate-400">No cards added.</p>
        ) : (
          <ul className="space-y-2">
            {cards.map((c) => (
              <li key={c.id} className="flex items-center justify-between text-sm">
                <span className="min-w-0">
                  <span className="block truncate text-slate-200">{c.name}</span>
                  <span className="text-xs text-slate-500">Due day {c.dueDay}</span>
                </span>
                <span className="font-semibold text-rose-300">{formatCurrency(c.balance)}</span>
              </li>
            ))}
          </ul>
        )}
      </PanelCard>

      <PanelCard title="Annual Coming Up" icon={CalendarDays} onClick={() => onNavigate("annual")}>
        {annualSoon.length === 0 ? (
          <p className="py-2 text-sm text-slate-400">Nothing planned.</p>
        ) : (
          <ul className="space-y-2">
            {annualSoon.map((a) => (
              <li key={a.id} className="flex items-center justify-between text-sm">
                <span className="min-w-0">
                  <span className="block truncate text-slate-200">{a.name}</span>
                  <span className="text-xs text-slate-500">
                    {MONTHS_SHORT[a.dueMonth - 1]}
                    {a.monthsAway === 0 ? " · this month" : ` · in ${a.monthsAway} mo`}
                  </span>
                </span>
                <span className="font-semibold text-slate-200">{formatCurrency(a.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </PanelCard>
    </aside>
  );
}
