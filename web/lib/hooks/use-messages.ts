"use client";

import { useState, useEffect, useCallback } from "react";
import { chatsApi } from "@/lib/api/chats";
import { subscribeToMessages } from "@/lib/realtime/messages";

type Message = Record<string, unknown>;

export function useMessages(chatId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);

  const fetchMessages = useCallback(async (cursorVal?: string) => {
    if (!chatId) return;

    try {
      const data = await chatsApi.getMessages(chatId, cursorVal);
      const msgs = Array.isArray(data) ? data : data?.messages ?? [];
      const newCursor = data?.nextCursor ?? undefined;

      if (cursorVal) {
        setMessages((prev) => [...msgs, ...prev]);
      } else {
        setMessages(msgs);
      }

      setCursor(newCursor);
      setHasMore(!!newCursor);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    if (!chatId) return;

    setLoading(true);
    setMessages([]);
    setCursor(undefined);
    setHasMore(true);
    fetchMessages();

    const unsubscribe = subscribeToMessages(
      chatId,
      (newMsg) => {
        setMessages((prev) => [...prev, newMsg]);
      },
      (updatedMsg) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m))
        );
      },
      (deletedMsg) => {
        setMessages((prev) => prev.filter((m) => m.id !== deletedMsg.id));
      }
    );

    return unsubscribe;
  }, [chatId, fetchMessages]);

  const loadMore = useCallback(() => {
    if (hasMore && cursor) fetchMessages(cursor);
  }, [hasMore, cursor, fetchMessages]);

  const sendMessage = useCallback(
    async (data: Record<string, unknown>) => {
      if (!chatId) return;
      try {
        await chatsApi.sendMessage(chatId, data);
      } catch (err) {
        console.error("Failed to send message:", err);
        throw err;
      }
    },
    [chatId]
  );

  return { messages, loading, hasMore, loadMore, sendMessage };
}
