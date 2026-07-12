"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, MoreVertical, Search, Bell, Ban } from "lucide-react";
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
        "flex items-center gap-3 px-4 py-3 glass border-b border-white/10 dark:border-white/5",
        className
      )}
    >
      <button
        onClick={() => router.push("/chat")}
        className="lg:hidden p-1 -ml-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <Avatar name={name} src={avatarUrl} size="md" online={online} />

      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-semibold truncate">{name}</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {online ? "Online" : "Offline"}
        </p>
      </div>

      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-full mt-1 z-50 glass-dark rounded-2xl p-1 shadow-xl min-w-[160px]">
              {[
                { icon: Search, label: "Search" },
                { icon: Bell, label: "Mute" },
                { icon: Ban, label: "Block" },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white hover:bg-white/10 rounded-xl transition-colors"
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
  );
}
