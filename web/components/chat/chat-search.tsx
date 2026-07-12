"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/cn";

interface ChatSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function ChatSearch({
  value,
  onChange,
  placeholder = "Search conversations...",
  className,
}: ChatSearchProps) {
  return (
    <div className={cn("relative px-4 py-3", className)}>
      <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-white/5 border border-white/5 text-white placeholder-white/30 outline-none focus:ring-1 focus:ring-bruce-500/30 focus:border-bruce-500/20 transition-all"
      />
    </div>
  );
}
