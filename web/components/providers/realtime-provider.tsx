"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type RealtimeStatus = "connecting" | "connected" | "disconnected";

interface RealtimeContextType {
  status: RealtimeStatus;
}

const RealtimeContext = createContext<RealtimeContextType>({ status: "disconnected" });

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<RealtimeStatus>("disconnected");

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase.channel("system");
    channel
      .on("system", { event: "*" }, (payload: Record<string, unknown>) => {
        if (payload.type === "connected") setStatus("connected");
        if (payload.type === "disconnected") setStatus("disconnected");
      })
      .subscribe((state) => {
        if (state === "SUBSCRIBED") setStatus("connected");
        if (state === "CHANNEL_ERROR") setStatus("disconnected");
      });

    const interval = setInterval(() => {
      if (supabase.getChannels().length === 0) {
        setStatus("disconnected");
      }
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  return (
    <RealtimeContext.Provider value={{ status }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  return useContext(RealtimeContext);
}
