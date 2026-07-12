import { createClient } from "@/lib/supabase/client";

type PresenceState = Record<string, { online_at: string; userId: string }>;

export function trackPresence(
  userId: string,
  onPresenceChange: (presence: Record<string, boolean>) => void
) {
  const supabase = createClient();

  const channel = supabase.channel("online-users", {
    config: { presence: { key: userId } },
  });

  channel
    .on("presence", { event: "sync" }, () => {
      const state = channel.presenceState<PresenceState>();
      const onlineUsers: Record<string, boolean> = {};
      Object.keys(state).forEach((key) => {
        onlineUsers[key] = true;
      });
      onPresenceChange(onlineUsers);
    })
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ online_at: new Date().toISOString(), userId });
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}
