import { useState } from "react";
import type { TabId } from "../../types";
import {
  LayoutDashboard,
  Target,
  Repeat,
  CreditCard,
  Home,
  CalendarDays,
  Receipt,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import { UserGuideModal } from "./UserGuideModal";

interface NavItem {
  id: TabId;
  label: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "transactions", label: "Transactions", icon: Receipt },
  { id: "budget", label: "Monthly Budget", icon: Target },
  { id: "bills", label: "Recurring Bills", icon: Repeat },
  { id: "cards", label: "Credit Cards", icon: CreditCard },
  { id: "home", label: "Home Expenses", icon: Home },
  { id: "annual", label: "Annual Expenses", icon: CalendarDays },
];

interface SidebarProps {
  active: TabId;
  onNavigate: (tab: TabId) => void;
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ active, onNavigate, open, onClose }: SidebarProps) {
  const [guideOpen, setGuideOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed z-40 flex h-full w-60 flex-col border-r border-white/[0.06] bg-[#0a0b10]/90 backdrop-blur-2xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-6 py-6">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
            {imgError ? (
              <span className="num text-sm font-bold text-gradient">R</span>
            ) : (
              <img
                src="Raj.jpg"
                alt="Raj"
                className="h-full w-full object-cover"
                onError={() => setImgError(true)}
              />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-white">Raj Tulsiani</p>
            <p className="text-[11px] text-slate-500">Personal Finance Tracker</p>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 px-3">
          {NAV.map((item) => {
            const isActive = active === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-200 ${
                  isActive
                    ? "bg-white/[0.05] font-medium text-white"
                    : "text-slate-400 hover:bg-white/[0.03] hover:text-slate-200"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-gradient-to-b from-brand-400 to-violet-400" />
                )}
                <Icon size={18} className={isActive ? "text-brand-300" : "text-slate-500 group-hover:text-slate-300"} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="space-y-3 px-3 pb-5 pt-3">
          <button
            onClick={() => setGuideOpen(true)}
            className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] px-3 py-2.5 text-sm text-slate-300 transition-colors hover:border-white/[0.14] hover:bg-white/[0.03] hover:text-white"
          >
            <BookOpen size={18} className="text-brand-300" />
            User Guide
          </button>
          <p className="flex items-center gap-1.5 px-3 text-[11px] text-slate-600">
            <span className="h-1.5 w-1.5 animate-glow-pulse rounded-full bg-emerald-400" />
            Saved locally in your browser
          </p>
        </div>
      </aside>

      <UserGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </>
  );
}
