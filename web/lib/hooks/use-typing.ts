"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  subscribeToTyping,
  broadcastTyping,
  broadcastStopTyping,
} from "@/lib/realtime/typing";

export function useTyping(chatId: string | undefined, userId: string | undefined) {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    if (!chatId) return;

    const cleanup = subscribeToTyping(
      chatId,
      (typingUserId) => {
        setTypingUsers((prev) => new Set(prev).add(typingUserId));
      },
      (stoppedUserId) => {
        setTypingUsers((prev) => {
          const next = new Set(prev);
          next.delete(stoppedUserId);
          return next;
        });
      }
    );

    return cleanup;
  }, [chatId]);

  const startTyping = useCallback(() => {
    if (!chatId || !userId || isTypingRef.current) return;

    isTypingRef.current = true;
    broadcastTyping(chatId, userId);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      broadcastStopTyping(chatId, userId);
    }, 3000);
  }, [chatId, userId]);

  const stopTyping = useCallback(() => {
    if (!chatId || !userId || !isTypingRef.current) return;

    isTypingRef.current = false;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    broadcastStopTyping(chatId, userId);
  }, [chatId, userId]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  return { typingUsers, startTyping, stopTyping };
}
