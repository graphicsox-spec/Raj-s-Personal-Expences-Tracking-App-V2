import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Field } from "./Input";

interface DatePickerProps {
  label?: string;
  /** ISO date "YYYY-MM-DD" */
  value: string;
  onChange: (iso: string) => void;
  className?: string;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function parseISO(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  if (!y) return new Date();
  return new Date(y, (m || 1) - 1, d || 1);
}

function pretty(s: string): string {
  if (!s) return "Select date";
  return parseISO(s).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const PANEL_W = 288;
const PANEL_H = 340;

/**
 * Custom calendar popover, rendered into a portal with fixed positioning so it
 * is never clipped by a parent's overflow (e.g. the modal body).
 */
export function DatePicker({ label, value, onChange, className = "" }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Date>(() => (value ? parseISO(value) : new Date()));
  const [pos, setPos] = useState<{ left: number; top?: number; bottom?: number }>({
    left: 0,
    top: 0,
  });
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const place = () => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const gap = 6;
    const dropUp = window.innerHeight - r.bottom < PANEL_H + 12 && r.top > PANEL_H;
    const left = Math.min(r.left, window.innerWidth - PANEL_W - 8);
    setPos({
      left: Math.max(8, left),
      top: dropUp ? undefined : r.bottom + gap,
      bottom: dropUp ? window.innerHeight - r.top + gap : undefined,
    });
  };

  const toggle = () => {
    if (!open) {
      if (value) setView(parseISO(value));
      place();
    }
    setOpen((o) => !o);
  };

  useEffect(() => {
    if (!open) return;
    const reposition = () => place();
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayISO = toISO(new Date());

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const pick = (day: number) => {
    onChange(toISO(new Date(year, month, day)));
    setOpen(false);
  };

  const panel =
    open &&
    createPortal(
      <div
        ref={panelRef}
        style={{
          position: "fixed",
          left: pos.left,
          top: pos.top,
          bottom: pos.bottom,
          width: PANEL_W,
        }}
        className="z-[100] rounded-2xl border border-white/10 bg-ink-700/95 p-3 shadow-glow backdrop-blur-xl animate-fade-up"
      >
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setView(new Date(year, month - 1, 1))}
            className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-white/10"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold text-white">
            {MONTHS[month]} {year}
          </span>
          <button
            type="button"
            onClick={() => setView(new Date(year, month + 1, 1))}
            className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-white/10"
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-slate-500">
          {WEEKDAYS.map((w) => (
            <div key={w}>{w}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null) return <div key={`b${i}`} />;
            const iso = toISO(new Date(year, month, day));
            const isSelected = iso === value;
            const isToday = iso === todayISO;
            return (
              <button
                key={iso}
                type="button"
                onClick={() => pick(day)}
                className={`flex h-8 items-center justify-center rounded-lg text-sm transition-colors ${
                  isSelected
                    ? "bg-brand-gradient font-semibold text-white"
                    : isToday
                    ? "border border-brand-400/50 text-brand-200 hover:bg-white/10"
                    : "text-slate-200 hover:bg-white/10"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        <div className="mt-2 flex justify-between border-t border-white/10 pt-2">
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className="text-xs font-medium text-slate-400 transition-colors hover:text-rose-300"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => {
              onChange(todayISO);
              setOpen(false);
            }}
            className="text-xs font-medium text-brand-300 transition-colors hover:text-brand-200"
          >
            Today
          </button>
        </div>
      </div>,
      document.body
    );

  const control = (
    <div ref={ref} className={`relative ${className}`}>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-100 transition-colors hover:border-white/20 focus:border-brand-400/60 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
      >
        <span className={value ? "" : "text-slate-500"}>{pretty(value)}</span>
        <Calendar size={16} className="ml-2 shrink-0 text-slate-400" />
      </button>
      {panel}
    </div>
  );

  return label ? <Field label={label}>{control}</Field> : control;
}
