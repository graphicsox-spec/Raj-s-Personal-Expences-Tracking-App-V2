import { useState } from "react";
import type { TabId } from "../../types";
import {
  LayoutDashboard,
  Target,
  Repeat,
  CreditCard,
  Home,
  CalendarDays,
  Wallet,
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
  { id: "budget", label: "Monthly Budget", icon: Target },
  { id: "bills", label: "Recurring Bills", icon: Repeat },
  { id: "cards", label: "Credit Cards", icon: CreditCard },
  { id: "home", label: "Home Expenses", icon: Home },
  { id: "annual", label: "Annual Expenses", icon: CalendarDays },
];

interface IconRailProps {
  active: TabId;
  onNavigate: (tab: TabId) => void;
}

function RailButton({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 ${
        active
          ? "bg-brand-gradient text-white shadow-glow-sm"
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      <Icon size={20} />
      {/* hover tooltip */}
      <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-lg border border-white/10 bg-ink-700/95 px-2.5 py-1 text-xs font-medium text-slate-100 opacity-0 shadow-glow backdrop-blur-xl transition-opacity duration-150 group-hover:opacity-100">
        {label}
      </span>
    </button>
  );
}

export function IconRail({ active, onNavigate }: IconRailProps) {
  const [guideOpen, setGuideOpen] = useState(false);

  return (
    <>
      <aside className="flex h-full w-[72px] flex-col items-center border-r border-white/10 bg-ink-800/80 py-5 backdrop-blur-2xl">
        {/* Brand */}
        <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-gradient shadow-glow-sm">
          <Wallet size={22} className="text-white" />
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col items-center gap-2">
          {NAV.map((item) => (
            <RailButton
              key={item.id}
              label={item.label}
              icon={item.icon}
              active={active === item.id}
              onClick={() => onNavigate(item.id)}
            />
          ))}
        </nav>

        {/* Footer: guide + status */}
        <div className="mt-4 flex flex-col items-center gap-3">
          <RailButton label="User Guide" icon={BookOpen} onClick={() => setGuideOpen(true)} />
          <span
            className="h-2 w-2 animate-glow-pulse rounded-full bg-emerald-400"
            title="Saved locally in your browser"
          />
        </div>
      </aside>

      <UserGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </>
  );
}
