import { createClient } from "@/lib/supabase/client";

type TypingHandler = (userId: string, chatId: string) => void;

export function subscribeToTyping(
  chatId: string,
  onTyping: TypingHandler,
  onStopTyping: TypingHandler
) {
  const supabase = createClient();

  const channel = supabase.channel(`typing:${chatId}`);

  channel
    .on("broadcast", { event: "typing" }, ({ payload }) => {
      onTyping(payload.userId, chatId);
    })
    .on("broadcast", { event: "stop_typing" }, ({ payload }) => {
      onStopTyping(payload.userId, chatId);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function broadcastTyping(chatId: string, userId: string) {
  const supabase = createClient();
  await supabase.channel(`typing:${chatId}`).send({
    type: "broadcast",
    event: "typing",
    payload: { userId, chatId },
  });
}

export async function broadcastStopTyping(chatId: string, userId: string) {
  const supabase = createClient();
  await supabase.channel(`typing:${chatId}`).send({
    type: "broadcast",
    event: "stop_typing",
    payload: { userId, chatId },
  });
}
