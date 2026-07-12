"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
  onClick?: () => void;
}

export function NavItem({ href, icon, label, active, badge, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
        active
          ? "bg-bruce-500/15 text-bruce-400"
          : "text-white/40 hover:text-white/80 hover:bg-white/5"
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-bruce-500 rounded-r-full" />
      )}
      <span className="shrink-0">{icon}</span>
      <span className="flex-1 truncate text-sm font-medium">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="shrink-0 min-w-[20px] h-5 flex items-center justify-center px-1.5 rounded-full bg-bruce-500 text-white text-[10px] font-bold">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}
