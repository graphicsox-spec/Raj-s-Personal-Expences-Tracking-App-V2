import type { MonthlyTrendPoint } from "../../hooks/useAnalytics";
import { formatCurrency } from "../../hooks/useAnalytics";

interface LineTrendProps {
  data: MonthlyTrendPoint[];
}

const W = 320;
const H = 110;
const PAD_X = 6;
const PAD_Y = 12;

function buildPath(values: number[], max: number): string {
  const n = values.length;
  if (n === 0) return "";
  const step = (W - PAD_X * 2) / Math.max(n - 1, 1);
  return values
    .map((v, i) => {
      const x = PAD_X + i * step;
      const y = H - PAD_Y - (max > 0 ? (v / max) * (H - PAD_Y * 2) : 0);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

/** Hand-drawn thin-line trend (income vs expenses). No chart library. */
export function LineTrend({ data }: LineTrendProps) {
  const income = data.map((d) => d.income);
  const expenses = data.map((d) => d.expenses);
  const max = Math.max(1, ...income, ...expenses);

  const incPath = buildPath(income, max);
  const expPath = buildPath(expenses, max);
  const areaPath = incPath
    ? `${incPath} L${W - PAD_X},${H - PAD_Y} L${PAD_X},${H - PAD_Y} Z`
    : "";

  const lastInc = income[income.length - 1] ?? 0;
  const lastExp = expenses[expenses.length - 1] ?? 0;

  return (
    <div>
      <div className="mb-3 flex items-center gap-5 text-xs">
        <span className="flex items-center gap-1.5 text-slate-400">
          <span className="h-0.5 w-4 rounded bg-emerald-400" /> Income
          <span className="num ml-1 text-slate-200">{formatCurrency(lastInc)}</span>
        </span>
        <span className="flex items-center gap-1.5 text-slate-400">
          <span className="h-0.5 w-4 rounded bg-violet-400" /> Expenses
          <span className="num ml-1 text-slate-200">{formatCurrency(lastExp)}</span>
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" style={{ height: 150 }}>
        <defs>
          <linearGradient id="incArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* faint baseline */}
        <line x1={PAD_X} y1={H - PAD_Y} x2={W - PAD_X} y2={H - PAD_Y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        {areaPath && <path d={areaPath} fill="url(#incArea)" />}
        <path d={expPath} fill="none" stroke="#a78bfa" strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" />
        <path d={incPath} fill="none" stroke="#34d399" strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" />
      </svg>

      <div className="mt-2 flex justify-between text-[10px] text-slate-600">
        {data.map((d) => (
          <span key={d.monthKey}>{d.month}</span>
        ))}
      </div>
    </div>
  );
}
