"use client";

import { useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatBubble } from "@/components/chat/chat-bubble";
import { ChatInput } from "@/components/chat/chat-input";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { ChatViewSkeleton } from "@/components/ui/skeleton";
import { useMessages } from "@/lib/hooks/use-messages";
import { useChat } from "@/lib/hooks/use-chat";
import { useAuth } from "@/lib/hooks/use-auth";
import { useTyping } from "@/lib/hooks/use-typing";
import { usePresence } from "@/lib/hooks/use-presence";

export default function ChatPage({ params }: { params: { chatId: string } }) {
  const { chatId } = params;
  const { user } = useAuth();
  const { chat, loading: chatLoading } = useChat(chatId);
  const {
    messages,
    loading: messagesLoading,
    hasMore,
    loadMore,
    sendMessage,
  } = useMessages(chatId);
  const { isOnline } = usePresence(user?.id);
  const { typingUsers, startTyping, stopTyping } = useTyping(chatId, user?.id);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);

  const scrollToBottom = useCallback((smooth = false) => {
    if (smooth) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      messagesEndRef.current?.scrollIntoView();
    }
  }, []);

  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      const isNewMessage = messages.length - prevMessageCountRef.current === 1;
      scrollToBottom(isNewMessage);
    }
    prevMessageCountRef.current = messages.length;
  }, [messages.length, scrollToBottom]);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || !hasMore) return;

    if (container.scrollTop < 100) {
      const prevHeight = container.scrollHeight;
      loadMore();
      setTimeout(() => {
        if (container) {
          container.scrollTop = container.scrollHeight - prevHeight;
        }
      }, 100);
    }
  }, [hasMore, loadMore]);

  const handleSend = useCallback(
    async (content: string) => {
      stopTyping();
      await sendMessage({ content, type: "text" });
    },
    [sendMessage, stopTyping]
  );

  const chatName = (chat?.name as string) || "Chat";
  const chatAvatar = chat?.avatar_url as string | null;
  const online = chat?.memberIds
    ? (chat.memberIds as string[]).some(
        (id: string) => id !== user?.id && isOnline(id)
      )
    : false;

  const typingUserNames = Array.from(typingUsers)
    .filter((id) => id !== user?.id)
    .map((id) => {
      const members = chat?.members as Array<Record<string, unknown>> | undefined;
      const member = members?.find((m: Record<string, unknown>) => m.id === id);
      return (member?.display_name as string) || "Someone";
    });

  return (
    <div className="h-full flex flex-col bg-[var(--chat-bg)] dark:bg-[var(--chat-bg-dark)]">
      <ChatHeader name={chatName} avatarUrl={chatAvatar} online={online} />

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-2"
      >
        {messagesLoading ? (
          <ChatViewSkeleton />
        ) : (
          <AnimatePresence initial={false}>
            {hasMore && (
              <div className="flex justify-center py-2">
                <button
                  onClick={loadMore}
                  className="text-xs text-bruce-500 hover:text-bruce-600 font-medium"
                >
                  Load older messages
                </button>
              </div>
            )}

            {(messages as Array<Record<string, unknown>>).map((msg) => (
              <ChatBubble
                key={msg.id as string}
                id={msg.id as string}
                type={((msg.type as string) || "text") as "text"}
                content={msg.content as string}
                timestamp={msg.created_at as string}
                status={msg.status as "sending" | "sent" | "delivered" | "read"}
                isOwn={msg.sender_id === user?.id}
                senderName={msg.sender_name as string}
                senderAvatar={msg.sender_avatar as string | null}
                replyTo={
                  msg.reply_to
                    ? (msg.reply_to as { content: string; senderName: string })
                    : null
                }
                mediaUrl={msg.media_url as string | undefined}
                reactions={msg.reactions as Record<string, string[]> | undefined}
                locationLat={msg.location_lat as number | undefined}
                locationLng={msg.location_lng as number | undefined}
                contactName={msg.contact_name as string | undefined}
                contactPhone={msg.contact_phone as string | undefined}
              />
            ))}
          </AnimatePresence>
        )}

        <TypingIndicator names={typingUserNames} />

        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        onSend={handleSend}
        onTyping={startTyping}
        className="shrink-0"
      />
    </div>
  );
}
