import type { CategorySpend } from "../../hooks/useAnalytics";
import { formatCurrency } from "../../hooks/useAnalytics";

interface CategoryMeterProps {
  data: CategorySpend[];
  /** Limit rows shown. */
  limit?: number;
}

/** Thin-line measurement rows — the minimal replacement for a pie chart. */
export function CategoryMeter({ data, limit = 8 }: CategoryMeterProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-slate-500">
        No spending recorded this month.
      </div>
    );
  }
  const total = data.reduce((s, d) => s + d.amount, 0);
  const rows = data.slice(0, limit);

  return (
    <div className="space-y-3.5">
      {rows.map((d) => {
        const pct = total > 0 ? (d.amount / total) * 100 : 0;
        return (
          <div key={d.categoryId}>
            <div className="mb-1 flex items-baseline justify-between text-sm">
              <span className="text-slate-300">{d.name}</span>
              <span className="flex items-baseline gap-2">
                <span className="num text-slate-100">{formatCurrency(d.amount)}</span>
                <span className="num w-9 text-right text-xs text-slate-500">{pct.toFixed(0)}%</span>
              </span>
            </div>
            {/* thin track + thin filled line */}
            <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/[0.07]">
              <div
                className="h-[3px] rounded-full bg-gradient-to-r from-brand-400 to-violet-400 transition-all duration-700 ease-out"
                style={{ width: `${pct}%`, boxShadow: "0 0 6px rgba(139,92,246,0.6)" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
