interface ProgressBarProps {
  /** 0-100+; values over 100 are clamped for the bar width. */
  percent: number;
  /** Optional explicit gradient/color classes; otherwise derived from thresholds. */
  colorClass?: string;
  className?: string;
}

function autoColor(percent: number): string {
  if (percent > 100) return "bg-gradient-to-r from-rose-500 to-red-500";
  if (percent >= 90) return "bg-gradient-to-r from-amber-400 to-orange-500";
  if (percent >= 70) return "bg-gradient-to-r from-brand-400 to-violet-400";
  return "bg-gradient-to-r from-emerald-400 to-teal-500";
}

/** Thin (3px) measurement line — consistent with the dashboard meters. */
export function ProgressBar({ percent, colorClass, className = "" }: ProgressBarProps) {
  const width = Math.min(Math.max(percent, 0), 100);
  const color = colorClass ?? autoColor(percent);
  return (
    <div className={`h-[3px] w-full overflow-hidden rounded-full bg-white/[0.07] ${className}`}>
      <div
        className={`h-[3px] rounded-full transition-all duration-700 ease-out ${color}`}
        style={{ width: `${width}%`, boxShadow: "0 0 6px rgba(139,92,246,0.45)" }}
      />
    </div>
  );
}
