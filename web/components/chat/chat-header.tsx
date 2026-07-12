"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, MoreVertical, Search, Phone, Video, Info } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/avatar";

interface ChatHeaderProps {
  name: string;
  avatarUrl?: string | null;
  online: boolean;
  className?: string;
}

export function ChatHeader({ name, avatarUrl, online, className }: ChatHeaderProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 glass-strong border-b border-white/5 shrink-0",
        className
      )}
    >
      <button
        onClick={() => router.push("/chat")}
        className="lg:hidden p-2 -ml-1 rounded-xl hover:bg-white/10 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>

      <Avatar name={name} src={avatarUrl} size="md" online={online} />

      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
          {name}
        </h2>
        <div className="flex items-center gap-1.5">
          {online && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {online ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button className="p-2.5 rounded-xl hover:bg-white/10 dark:hover:bg-white/5 transition-colors text-gray-500 dark:text-gray-400">
          <Phone className="w-4.5 h-4.5" />
        </button>
        <button className="p-2.5 rounded-xl hover:bg-white/10 dark:hover:bg-white/5 transition-colors text-gray-500 dark:text-gray-400">
          <Video className="w-4.5 h-4.5" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2.5 rounded-xl hover:bg-white/10 dark:hover:bg-white/5 transition-colors text-gray-500 dark:text-gray-400"
          >
            <MoreVertical className="w-4.5 h-4.5" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-2 z-50 glass-dark rounded-2xl p-1.5 shadow-float min-w-[180px]">
                {[
                  { icon: Search, label: "Search" },
                  { icon: Info, label: "Info" },
                  { icon: Phone, label: "Voice call" },
                ].map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                    onClick={() => setShowMenu(false)}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
