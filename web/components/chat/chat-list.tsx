"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { ChatItem } from "@/components/chat/chat-item";
import { ChatListSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useChats } from "@/lib/hooks/use-chat";
import { usePathname } from "next/navigation";

export function ChatList() {
  const [search, setSearch] = useState("");
  const { chats, loading } = useChats();
  const pathname = usePathname();

  const activeChatId = pathname.split("/chat/")[1];

  const filtered = (chats as Array<Record<string, unknown>>).filter((chat) => {
    if (!search) return true;
    const name = (chat.name as string) || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {loading ? (
          <ChatListSkeleton />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-white/20" />
            </div>
            <p className="text-sm text-white/40 font-medium">No conversations</p>
            <p className="text-xs text-white/20 mt-1">
              Start a new chat to see it here
            </p>
          </div>
        ) : (
          filtered.map((chat) => (
            <ChatItem
              key={chat.id as string}
              id={chat.id as string}
              name={chat.name as string}
              avatarUrl={chat.avatar_url as string | null}
              lastMessage={chat.last_message as string}
              lastMessageType={chat.last_message_type as string}
              timestamp={chat.last_message_at as string}
              unreadCount={(chat.unread_count as number) ?? 0}
              online={(chat.online as boolean) ?? false}
              active={chat.id === activeChatId}
            />
          ))
        )}
      </div>
    </div>
  );
}
