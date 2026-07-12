import { createClient } from "@/lib/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type StatusPayload = RealtimePostgresChangesPayload<Record<string, unknown>>;

export function subscribeToReadReceipts(
  chatId: string,
  onStatusChange: (data: { messageId: string; userId: string; status: string }) => void
) {
  const supabase = createClient();

  const channel = supabase
    .channel(`read-receipts:${chatId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "message_status",
        filter: `chat_id=eq.${chatId}`,
      },
      (payload: StatusPayload) => {
        if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
          const record = payload.new as Record<string, string>;
          onStatusChange({
            messageId: record.message_id,
            userId: record.user_id,
            status: record.status,
          });
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
