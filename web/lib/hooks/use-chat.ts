"use client";

import { useState, useEffect } from "react";
import { chatsApi } from "@/lib/api/chats";
import { createClient } from "@/lib/supabase/client";

type Chat = Record<string, unknown>;

export function useChats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = async () => {
    try {
      const data = await chatsApi.list();
      setChats(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch chats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();

    const supabase = createClient();
    const channel = supabase
      .channel("chat-members-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_members" },
        () => {
          fetchChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { chats, loading, refetch: fetchChats };
}

export function useChat(chatId: string | undefined) {
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatId) return;

    setLoading(true);
    chatsApi
      .get(chatId)
      .then((data) => setChat(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [chatId]);

  return { chat, loading };
}
