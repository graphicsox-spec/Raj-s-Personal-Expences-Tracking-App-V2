/**
 * Dashboard – minimal, thin-line command center.
 */
import { useState } from "react";
import type { ReactNode } from "react";
import {
  Wallet,
  Receipt,
  PiggyBank,
  CreditCard,
  Home,
  Target,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Repeat,
  CalendarDays,
} from "lucide-react";
import { MetricCard } from "./MetricCard";
import { RingGauge } from "../charts/RingGauge";
import { LineTrend } from "../charts/LineTrend";
import { CategoryMeter } from "../charts/CategoryMeter";
import { IncomeModal } from "../common/IncomeModal";
import { useAppState } from "../../context/AppStateContext";
import { useAnalytics, formatCurrency, monthKey } from "../../hooks/useAnalytics";
import type { TabId } from "../../types";

interface DashboardProps {
  onNavigate: (tab: TabId) => void;
}

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const SUB_COLORS = ["bg-brand-400", "bg-emerald-400", "bg-amber-400", "bg-sky-400"];

function Panel({
  title,
  hint,
  children,
  className = "",
}: {
  title: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel p-5 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {hint}
      </div>
      {children}
    </section>
  );
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const a = useAnalytics();
  const { state } = useAppState();
  const fc = (n: number) => formatCurrency(n);
  const [incomeOpen, setIncomeOpen] = useState(false);

  const mk = monthKey();
  const thisMonth = new Date().getMonth() + 1;
  const upcomingBills = [...state.recurringBills]
    .filter((b) => !b.paidMonths[mk])
    .sort((a, b) => a.dueDay - b.dueDay)
    .slice(0, 4);
  const annualSoon = [...state.annualExpenses]
    .map((x) => ({ ...x, away: (x.dueMonth - thisMonth + 12) % 12 }))
    .sort((x, y) => x.away - y.away)
    .slice(0, 3);

  const budgetUsed = a.totalBudgeted > 0 ? (a.totalBudgetActual / a.totalBudgeted) * 100 : 0;
  const cardUtil = a.creditCardLimit > 0 ? (a.creditCardBalances / a.creditCardLimit) * 100 : 0;

  return (
    <div className="space-y-5">
      {/* Metric grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Monthly Income" value={a.totalIncome} format={fc} icon={Wallet} accent="text-emerald-400" valueClass="text-emerald-300" delay="delay-1" onClick={() => setIncomeOpen(true)} actionHint="Edit" />
        <MetricCard label="Total Expenses" value={a.totalExpenses} format={fc} icon={Receipt} accent="text-rose-400" valueClass="text-rose-300" delay="delay-2" onClick={() => onNavigate("transactions")} actionHint="View all" actionType="go" />
        <MetricCard label="Savings" value={a.savings} format={fc} icon={PiggyBank} accent="text-brand-300" valueClass={a.savings >= 0 ? "text-emerald-300" : "text-rose-300"} caption={`${a.savingsRate.toFixed(0)}% of income`} delay="delay-3" onClick={() => setIncomeOpen(true)} actionHint="Adjust" />
        <MetricCard label="Card Balances" value={a.creditCardBalances} format={fc} icon={CreditCard} accent="text-amber-400" valueClass="text-amber-300" caption={`of ${formatCurrency(a.creditCardLimit)} limit`} delay="delay-4" onClick={() => onNavigate("cards")} actionHint="Manage" actionType="go" />
        <MetricCard label="Mortgage + Utilities" value={a.mortgageUtilities} format={fc} icon={Home} accent="text-sky-400" caption="Fixed home overheads" delay="delay-5" onClick={() => onNavigate("transactions")} actionHint="View" actionType="go" />
        <MetricCard label="Remaining Budget" value={a.remainingBudget} format={fc} icon={Target} accent="text-violet-400" valueClass={a.remainingBudget >= 0 ? "text-emerald-300" : "text-rose-300"} caption={`of ${formatCurrency(a.totalBudgeted)} budgeted`} delay="delay-6" onClick={() => onNavigate("budget")} actionHint="Budgets" actionType="go" />
      </div>

      {/* Cashflow + ring gauges */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Panel title="Cashflow" hint={<span className="text-xs text-slate-500">Last 6 months</span>} className="lg:col-span-2 animate-fade-up">
          <LineTrend data={a.monthlyTrend} />
        </Panel>
        <Panel title="Health" className="animate-fade-up">
          <div className="flex items-center justify-around gap-2 py-2">
            <RingGauge percent={Math.max(a.savingsRate, 0)} label="Savings rate" color="#34d399" size={84} />
            <RingGauge percent={budgetUsed} label="Budget used" color="#8b5cf6" size={84} />
            <RingGauge percent={cardUtil} label="Card usage" color={cardUtil > 70 ? "#fb7185" : "#f59e0b"} size={84} />
          </div>
        </Panel>
      </div>

      {/* Where money goes + upcoming */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Panel title="Where your money goes" hint={<span className="text-xs text-slate-500">This month</span>} className="lg:col-span-2 animate-fade-up">
          <CategoryMeter data={a.spendByCategory} />
        </Panel>

        <Panel
          title="Upcoming"
          hint={
            <button onClick={() => onNavigate("bills")} className="text-xs font-medium text-brand-300 hover:text-brand-200">
              Bills →
            </button>
          }
          className="animate-fade-up"
        >
          <div className="space-y-4">
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                <Repeat size={12} /> Unpaid bills
              </p>
              {upcomingBills.length === 0 ? (
                <p className="flex items-center gap-1.5 text-sm text-slate-400">
                  <CheckCircle2 size={14} className="text-emerald-400" /> All paid this month
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {upcomingBills.map((b) => (
                    <li key={b.id} className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">{b.name}</span>
                      <span className="num text-slate-200">{formatCurrency(b.amount)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-white/[0.06] pt-3">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                <CalendarDays size={12} /> Annual coming up
              </p>
              {annualSoon.length === 0 ? (
                <p className="text-sm text-slate-400">Nothing planned</p>
              ) : (
                <ul className="space-y-1.5">
                  {annualSoon.map((x) => (
                    <li key={x.id} className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">
                        {x.name}
                        <span className="ml-1.5 text-xs text-slate-600">
                          {x.away === 0 ? "this mo" : `${MONTHS_SHORT[x.dueMonth - 1]}`}
                        </span>
                      </span>
                      <span className="num text-slate-200">{formatCurrency(x.amount)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Panel>
      </div>

      {/* Sub-category breakdown + budget alerts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel title="By person / sub-category" className="animate-fade-up">
          {a.subBreakdown.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No sub-category spending yet.</p>
          ) : (
            <div className="space-y-4">
              {a.subBreakdown.map((cat) => (
                <div key={cat.categoryId}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-slate-300">{cat.name}</span>
                    <span className="num text-slate-200">{formatCurrency(cat.total)}</span>
                  </div>
                  <div className="flex h-[3px] w-full overflow-hidden rounded-full bg-white/[0.07]">
                    {cat.subs.map((s, i) => (
                      <div
                        key={s.id}
                        className={`h-[3px] ${SUB_COLORS[i % SUB_COLORS.length]}`}
                        style={{ width: `${(s.amount / cat.total) * 100}%` }}
                        title={`${s.name}: ${formatCurrency(s.amount)}`}
                      />
                    ))}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                    {cat.subs.map((s, i) => (
                      <span key={s.id} className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span className={`h-1.5 w-1.5 rounded-full ${SUB_COLORS[i % SUB_COLORS.length]}`} />
                        {s.name}: <span className="num text-slate-300">{formatCurrency(s.amount)}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel
          title="Budget alerts"
          hint={
            <button onClick={() => onNavigate("budget")} className="inline-flex items-center gap-1 text-xs font-medium text-brand-300 hover:text-brand-200">
              Manage <ArrowRight size={12} />
            </button>
          }
          className="animate-fade-up"
        >
          {a.budgetStatuses.filter((b) => b.warning).length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
              <CheckCircle2 size={24} className="text-emerald-400" />
              <p className="text-sm text-slate-400">All budgets within healthy limits.</p>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {a.budgetStatuses.filter((b) => b.warning).map((b) => (
                <li key={b.categoryId} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm">
                    <AlertTriangle size={15} className={b.over ? "text-rose-400" : "text-amber-400"} />
                    <span className="text-slate-300">{b.name}</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="num text-xs text-slate-500">
                      {formatCurrency(b.actual)}/{formatCurrency(b.limit)}
                    </span>
                    <span className={`num text-sm font-semibold ${b.over ? "text-rose-300" : "text-amber-300"}`}>
                      {b.percent.toFixed(0)}%
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <IncomeModal open={incomeOpen} onClose={() => setIncomeOpen(false)} />
    </div>
  );
}
