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

function lastMessagePreview(text?: string, type?: string): string {
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
        "w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 rounded-2xl mx-1",
        "hover:bg-white/5",
        active && "bg-bruce-500/10 border border-bruce-500/20",
        !active && "border border-transparent"
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
              "text-sm truncate",
              unreadCount > 0
                ? "font-bold text-white"
                : "font-medium text-white/80"
            )}
          >
            {name}
          </h3>
          {timestamp && (
            <span
              className={cn(
                "text-[11px] shrink-0 ml-2",
                unreadCount > 0
                  ? "text-bruce-400 font-medium"
                  : "text-white/30"
              )}
            >
              {formatTime(timestamp)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-0.5">
          <p
            className={cn(
              "text-xs truncate",
              unreadCount > 0
                ? "text-white/70 font-medium"
                : "text-white/40"
            )}
          >
            {lastMessagePreview(lastMessage, lastMessageType)}
          </p>
          {unreadCount > 0 && (
            <Badge count={unreadCount} className="shrink-0 ml-2" />
          )}
        </div>
      </div>
    </button>
  );
}
