"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { ChatItem } from "@/components/chat/chat-item";
import { ChatSearch } from "@/components/chat/chat-search";
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
      <ChatSearch value={search} onChange={setSearch} />

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <ChatListSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<MessageCircle className="w-12 h-12" />}
            title="No chats yet"
            description="Start a new conversation to see it here"
          />
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
