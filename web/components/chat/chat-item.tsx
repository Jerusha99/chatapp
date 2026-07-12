"use client";

import { useRouter } from "next/navigation";
import { format, isToday, isYesterday } from "date-fns";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ChatItemProps {
  id: string;
  name: string;
  avatarUrl?: string | null;
  lastMessage?: string;
  lastMessageType?: string;
  timestamp?: string;
  unreadCount: number;
  online: boolean;
  active?: boolean;
}

function formatTime(dateStr?: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isToday(date)) return format(date, "h:mm a");
  if (isYesterday(date)) return "Yesterday";
  return format(date, "M/d/yy");
}

function lastMessagePreview(
  text?: string,
  type?: string
): string {
  if (!text) return "No messages yet";
  if (type && type !== "text") {
    const icons: Record<string, string> = {
      image: "Photo",
      video: "Video",
      voice: "Voice message",
      document: "Document",
      location: "Location",
      contact: "Contact",
    };
    return icons[type] || text;
  }
  return text;
}

export function ChatItem({
  id,
  name,
  avatarUrl,
  lastMessage,
  lastMessageType,
  timestamp,
  unreadCount,
  online,
  active,
}: ChatItemProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/chat/${id}`)}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 transition-all duration-200",
        "hover:bg-white/50 dark:hover:bg-white/5",
        active && "bg-white/60 dark:bg-white/10",
        "border-b border-gray-100 dark:border-gray-800/50 last:border-0"
      )}
    >
      <Avatar
        name={name}
        src={avatarUrl}
        size="lg"
        online={online}
        className="shrink-0"
      />

      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between">
          <h3
            className={cn(
              "text-sm font-semibold truncate",
              unreadCount > 0
                ? "text-gray-900 dark:text-gray-100"
                : "text-gray-800 dark:text-gray-200"
            )}
          >
            {name}
          </h3>
          {timestamp && (
            <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 ml-2">
              {formatTime(timestamp)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-0.5">
          <p
            className={cn(
              "text-sm truncate",
              unreadCount > 0
                ? "text-gray-700 dark:text-gray-300 font-medium"
                : "text-gray-500 dark:text-gray-400"
            )}
          >
            {lastMessagePreview(lastMessage, lastMessageType)}
          </p>
          {unreadCount > 0 && <Badge count={unreadCount} className="shrink-0 ml-2" />}
        </div>
      </div>
    </button>
  );
}
