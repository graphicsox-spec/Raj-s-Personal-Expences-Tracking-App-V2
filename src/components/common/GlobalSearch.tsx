import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useAppState } from "../../context/AppStateContext";
import { formatCurrency } from "../../hooks/useAnalytics";
import { getCategoryName, type TabId } from "../../types";

interface SearchHit {
  id: string;
  label: string;
  meta: string;
  amount?: number;
  tab: TabId;
}

interface GlobalSearchProps {
  onNavigate: (tab: TabId) => void;
}

/** Lightweight cross-data search across bills, cards, home, annual & expenses. */
export function GlobalSearch({ onNavigate }: GlobalSearchProps) {
  const { state } = useAppState();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const index = useMemo<SearchHit[]>(() => {
    const hits: SearchHit[] = [];
    for (const b of state.recurringBills)
      hits.push({ id: "b" + b.id, label: b.name, meta: "Recurring bill", amount: b.amount, tab: "bills" });
    for (const c of state.creditCards)
      hits.push({ id: "c" + c.id, label: c.name, meta: "Credit card", amount: c.balance, tab: "cards" });
    for (const h of state.homeExpenses)
      hits.push({ id: "h" + h.id, label: h.name, meta: "Home expense", amount: h.amount, tab: "home" });
    for (const a of state.annualExpenses)
      hits.push({ id: "a" + a.id, label: a.name, meta: "Annual expense", amount: a.amount, tab: "annual" });
    for (const t of state.transactions)
      hits.push({
        id: "t" + t.id,
        label: t.description || getCategoryName(t.categoryId),
        meta: getCategoryName(t.categoryId),
        amount: t.amount,
        tab: "dashboard",
      });
    return hits;
  }, [state]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return index
      .filter((h) => h.label.toLowerCase().includes(term) || h.meta.toLowerCase().includes(term))
      .slice(0, 8);
  }, [q, index]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const go = (h: SearchHit) => {
    onNavigate(h.tab);
    setOpen(false);
    setQ("");
  };

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 transition-colors focus-within:border-brand-400/60 focus-within:ring-2 focus-within:ring-brand-500/30">
        <Search size={16} className="shrink-0 text-slate-400" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search bills, cards, expenses…"
          className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
        />
        {q && (
          <button onClick={() => setQ("")} className="text-slate-500 hover:text-slate-300" aria-label="Clear">
            <X size={14} />
          </button>
        )}
      </div>

      {open && q.trim() && (
        <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-white/10 bg-ink-700/95 p-1 shadow-glow backdrop-blur-xl animate-fade-up">
          {results.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-slate-500">No matches found.</p>
          ) : (
            results.map((h) => (
              <button
                key={h.id}
                onClick={() => go(h)}
                className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/10"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-slate-200">{h.label}</span>
                  <span className="block text-xs text-slate-500">{h.meta}</span>
                </span>
                {h.amount !== undefined && (
                  <span className="shrink-0 text-sm font-semibold text-slate-300">
                    {formatCurrency(h.amount)}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
