import { useRef } from "react";
import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  ReactNode,
} from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

const baseField =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 transition-colors focus:border-brand-400/60 focus:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-brand-500/30";

interface FieldWrapProps {
  label?: string;
  children: ReactNode;
  className?: string;
}

export function Field({ label, children, className = "" }: FieldWrapProps) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="mb-1 block text-xs font-medium text-slate-400">
          {label}
        </span>
      )}
      {children}
    </label>
  );
}

/** Push a value into a controlled input so React's onChange fires naturally. */
function setNativeValue(el: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value"
  )?.set;
  setter?.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = "", type, ...rest }: InputProps) {
  const ref = useRef<HTMLInputElement>(null);

  // Number inputs get custom dark stepper arrows instead of the native spinner.
  if (type === "number") {
    const stepStr = rest.step !== undefined ? String(rest.step) : "1";
    const step = Number(stepStr) || 1;
    const decimals = stepStr.includes(".") ? stepStr.split(".")[1].length : 0;
    const min = rest.min !== undefined ? Number(rest.min) : undefined;
    const max = rest.max !== undefined ? Number(rest.max) : undefined;

    const bump = (dir: 1 | -1) => {
      const el = ref.current;
      if (!el) return;
      const cur = parseFloat(el.value || "0") || 0;
      let next = cur + dir * step;
      if (min !== undefined && next < min) next = min;
      if (max !== undefined && next > max) next = max;
      setNativeValue(el, decimals > 0 ? next.toFixed(decimals) : String(next));
    };

    const field = (
      <div className="relative">
        <input
          ref={ref}
          type="number"
          className={`${baseField} pr-9 ${className}`}
          {...rest}
        />
        <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 flex-col gap-0.5">
          <button
            type="button"
            tabIndex={-1}
            onClick={() => bump(1)}
            className="flex h-4 w-5 items-center justify-center rounded text-slate-400 transition-colors hover:bg-white/10 hover:text-brand-300"
            aria-label="Increase"
          >
            <ChevronUp size={13} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            tabIndex={-1}
            onClick={() => bump(-1)}
            className="flex h-4 w-5 items-center justify-center rounded text-slate-400 transition-colors hover:bg-white/10 hover:text-brand-300"
            aria-label="Decrease"
          >
            <ChevronDown size={13} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    );
    return label ? <Field label={label}>{field}</Field> : field;
  }

  const field = (
    <input ref={ref} type={type} className={`${baseField} ${className}`} {...rest} />
  );
  return label ? <Field label={label}>{field}</Field> : field;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  children: ReactNode;
}

export function Select({ label, className = "", children, ...rest }: SelectProps) {
  const field = (
    <select
      className={`${baseField} [&>option]:bg-ink-700 [&>option]:text-slate-100 ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
  return label ? <Field label={label}>{field}</Field> : field;
}
