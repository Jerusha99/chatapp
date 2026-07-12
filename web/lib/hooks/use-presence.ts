"use client";

import { useState, useEffect } from "react";
import { trackPresence } from "@/lib/realtime/presence";

export function usePresence(userId: string | undefined) {
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!userId) return;

    const cleanup = trackPresence(userId, (presence) => {
      setOnlineUsers(presence);
    });

    return cleanup;
  }, [userId]);

  const isOnline = (otherUserId: string) => !!onlineUsers[otherUserId];

  return { onlineUsers, isOnline };
}
