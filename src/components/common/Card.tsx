import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  lift?: boolean;
}

export function Card({ children, className = "", lift = false }: CardProps) {
  return (
    <div className={`glass p-5 shadow-card ${lift ? "lift" : ""} ${className}`}>
      {children}
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-white">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
