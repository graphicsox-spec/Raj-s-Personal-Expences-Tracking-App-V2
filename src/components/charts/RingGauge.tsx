interface RingGaugeProps {
  /** 0-100 (clamped). */
  percent: number;
  label: string;
  /** Big text in the centre; defaults to "NN%". */
  centerText?: string;
  /** Stroke color (any CSS color). */
  color?: string;
  size?: number;
}

/** A thin-stroke circular gauge — minimal, no fills. */
export function RingGauge({
  percent,
  label,
  centerText,
  color = "#8b5cf6",
  size = 96,
}: RingGaugeProps) {
  const p = Math.min(Math.max(percent, 0), 100);
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (p / 100) * c;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="num text-lg font-bold text-white">
            {centerText ?? `${Math.round(p)}%`}
          </span>
        </div>
      </div>
      <span className="text-center text-xs font-medium text-slate-400">{label}</span>
    </div>
  );
}
