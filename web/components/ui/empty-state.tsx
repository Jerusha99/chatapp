"use client";

import { cn } from "@/lib/cn";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8",
        className
      )}
    >
      {icon && (
        <div className="mb-4 w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-bruce-400/50">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-white/80 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-white/30 max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
