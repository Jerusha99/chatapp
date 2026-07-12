import { createClient } from "@/lib/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type MessagePayload = RealtimePostgresChangesPayload<Record<string, unknown>>;

export function subscribeToMessages(
  chatId: string,
  onInsert: (message: Record<string, unknown>) => void,
  onUpdate?: (message: Record<string, unknown>) => void,
  onDelete?: (message: Record<string, unknown>) => void
) {
  const supabase = createClient();

  const channel = supabase
    .channel(`messages:${chatId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `chat_id=eq.${chatId}`,
      },
      (payload: MessagePayload) => onInsert(payload.new)
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "messages",
        filter: `chat_id=eq.${chatId}`,
      },
      (payload: MessagePayload) => onUpdate?.(payload.new)
    )
    .on(
      "postgres_changes",
      {
        event: "DELETE",
        schema: "public",
        table: "messages",
        filter: `chat_id=eq.${chatId}`,
      },
      (payload: MessagePayload) => onDelete?.(payload.old)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
