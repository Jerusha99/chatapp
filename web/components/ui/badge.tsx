"use client";

import { cn } from "@/lib/cn";

interface BadgeProps {
  count: number;
  className?: string;
}

export function Badge({ count, className }: BadgeProps) {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full",
        "bg-gradient-to-r from-bruce-500 to-bruce-600 text-white text-xs font-bold",
        className
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
