import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { Field } from "./Input";

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

interface Pos {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
  maxHeight: number;
}

/**
 * Fully custom dropdown. The menu is rendered into a portal with fixed
 * positioning so it escapes any parent's `overflow:hidden` (e.g. the modal
 * body) and is always fully visible / scrollable.
 */
export function CustomSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Select…",
  className = "",
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<Pos>({ left: 0, width: 0, top: 0, maxHeight: 240 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  const place = () => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const gap = 6;
    const spaceBelow = window.innerHeight - r.bottom - 12;
    const spaceAbove = r.top - 12;
    const dropUp = spaceBelow < 200 && spaceAbove > spaceBelow;
    setPos({
      left: r.left,
      width: r.width,
      top: dropUp ? undefined : r.bottom + gap,
      bottom: dropUp ? window.innerHeight - r.top + gap : undefined,
      maxHeight: Math.min(280, (dropUp ? spaceAbove : spaceBelow)),
    });
  };

  const toggle = () => {
    if (!open) place();
    setOpen((o) => !o);
  };

  useEffect(() => {
    if (!open) return;
    const reposition = () => place();
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || menuRef.current?.contains(t)) return;
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

  const menu =
    open &&
    createPortal(
      <div
        ref={menuRef}
        style={{
          position: "fixed",
          left: pos.left,
          width: pos.width,
          top: pos.top,
          bottom: pos.bottom,
          maxHeight: pos.maxHeight,
        }}
        className="z-[100] overflow-y-auto rounded-xl border border-white/10 bg-ink-700/95 p-1 shadow-glow backdrop-blur-xl animate-fade-up"
      >
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                active ? "bg-brand-gradient text-white" : "text-slate-200 hover:bg-white/10"
              }`}
            >
              <span className="truncate">{o.label}</span>
              {active && <Check size={14} className="shrink-0" />}
            </button>
          );
        })}
      </div>,
      document.body
    );

  const control = (
    <div className={`relative ${className}`}>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-100 transition-colors hover:border-white/20 focus:border-brand-400/60 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
      >
        <span className={selected ? "truncate" : "truncate text-slate-500"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`ml-2 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {menu}
    </div>
  );

  return label ? <Field label={label}>{control}</Field> : control;
}
