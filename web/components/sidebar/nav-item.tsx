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
        "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group",
        active
          ? "glass text-bruce-600 dark:text-bruce-400 font-medium"
          : "text-gray-600 dark:text-gray-400 hover:glass hover:text-gray-900 dark:hover:text-gray-100"
      )}
    >
      <span className="shrink-0">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="shrink-0 min-w-[20px] h-5 flex items-center justify-center px-1.5 rounded-full bg-bruce-500 text-white text-xs font-bold">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}
