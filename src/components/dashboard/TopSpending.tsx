import type { CategorySpend } from "../../hooks/useAnalytics";
import { formatCurrency } from "../../hooks/useAnalytics";

interface Props {
  data: CategorySpend[];
}

const BAR_GRADIENTS = [
  "from-indigo-400 to-violet-500",
  "from-violet-400 to-fuchsia-500",
  "from-sky-400 to-cyan-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
];

export function TopSpending({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-slate-500">
        No spending yet.
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.amount));

  return (
    <div className="space-y-4">
      {data.map((d, i) => (
        <div key={d.categoryId}>
          <div className="mb-1.5 flex justify-between text-sm">
            <span className="font-medium text-slate-300">
              <span className="mr-2 text-xs font-bold text-slate-500">#{i + 1}</span>
              {d.name}
            </span>
            <span className="font-semibold text-slate-200">
              {formatCurrency(d.amount)}
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out ${
                BAR_GRADIENTS[i % BAR_GRADIENTS.length]
              }`}
              style={{ width: `${max > 0 ? (d.amount / max) * 100 : 0}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
