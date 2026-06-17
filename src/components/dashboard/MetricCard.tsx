import type { LucideIcon } from "lucide-react";
import { Pencil, ArrowUpRight } from "lucide-react";
import { useCountUp } from "../../hooks/useCountUp";

interface MetricCardProps {
  label: string;
  value: number;
  format?: (n: number) => string;
  icon: LucideIcon;
  caption?: string;
  valueClass?: string;
  accent?: string;
  delay?: string;
  onClick?: () => void;
  actionHint?: string;
  actionType?: "edit" | "go";
}

export function MetricCard({
  label,
  value,
  format = (n) => String(Math.round(n)),
  icon: Icon,
  caption,
  valueClass = "text-white",
  accent = "text-slate-500",
  delay = "",
  onClick,
  actionHint = "Edit",
  actionType = "edit",
}: MetricCardProps) {
  const animated = useCountUp(value);
  const clickable = !!onClick;
  const ActionIcon = actionType === "go" ? ArrowUpRight : Pencil;

  return (
    <div
      onClick={onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={`panel ${clickable ? "lift cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-400/40" : ""} group animate-fade-up p-5 ${delay}`}
    >
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <Icon size={16} className={accent} />
      </div>

      <p className={`num mt-3 text-2xl font-bold ${valueClass}`}>{format(animated)}</p>

      <div className="mt-1 flex items-center justify-between">
        {caption ? <p className="text-xs text-slate-500">{caption}</p> : <span />}
        {clickable && (
          <span className="flex items-center gap-1 text-[11px] font-medium text-brand-300/0 transition-colors group-hover:text-brand-300">
            {actionHint} <ActionIcon size={11} />
          </span>
        )}
      </div>
    </div>
  );
}
