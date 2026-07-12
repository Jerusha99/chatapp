"use client";

import { MessageCircle } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function ChatEmptyPage() {
  return (
    <div className="h-full flex items-center justify-center bg-[var(--chat-bg)] dark:bg-[var(--chat-bg-dark)]">
      <EmptyState
        icon={<MessageCircle className="w-16 h-16" />}
        title="Chat Bruce"
        description="Select a conversation from the sidebar or start a new chat"
      />
    </div>
  );
}
