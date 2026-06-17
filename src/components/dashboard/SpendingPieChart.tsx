import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { CategorySpend } from "../../hooks/useAnalytics";
import { formatCurrency } from "../../hooks/useAnalytics";

const COLORS = [
  "#818cf8", "#34d399", "#fbbf24", "#fb7185", "#a78bfa",
  "#22d3ee", "#f472b6", "#a3e635", "#fb923c", "#2dd4bf",
  "#60a5fa", "#c084fc",
];

interface Props {
  data: CategorySpend[];
}

export function SpendingPieChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500">
        No spending recorded this month.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={62}
          outerRadius={102}
          paddingAngle={3}
          stroke="rgba(7,10,22,0.6)"
          strokeWidth={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
        <Legend
          iconType="circle"
          wrapperStyle={{ fontSize: 12 }}
          formatter={(value) => <span className="text-slate-400">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
