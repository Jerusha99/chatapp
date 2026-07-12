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
  placeholder = "Search chats...",
  className,
}: ChatSearchProps) {
  return (
    <div className={cn("relative px-4 py-3", className)}>
      <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2 text-sm rounded-2xl glass bg-white/40 dark:bg-black/20 text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-bruce-500/30 transition-all"
      />
    </div>
  );
}
