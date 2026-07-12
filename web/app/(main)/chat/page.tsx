"use client";

import { MessageCircle } from "lucide-react";

export default function ChatEmptyPage() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center text-center px-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-bruce-400 to-bruce-700 flex items-center justify-center mb-6 shadow-glow animate-float">
          <MessageCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Chat Bruce
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
          Select a conversation from the sidebar or start a new chat
        </p>
      </div>
    </div>
  );
}
