import { api } from "./client";
import type { CreateChatInput } from "@/lib/validators";

export const chatsApi = {
  list: () => api.get("/api/v1/chats"),

  get: (chatId: string) => api.get(`/api/v1/chats/${chatId}`),

  create: (data: CreateChatInput) => api.post("/api/v1/chats", data),

  addMember: (chatId: string, userId: string) =>
    api.post(`/api/v1/chats/${chatId}/members`, { userId }),

  getMessages: (chatId: string, cursor?: string, limit = 50) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set("cursor", cursor);
    return api.get(`/api/v1/chats/${chatId}/messages?${params}`);
  },

  sendMessage: (chatId: string, data: Record<string, unknown>) =>
    api.post(`/api/v1/chats/${chatId}/messages`, data),
};
