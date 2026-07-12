import { api } from "./client";

export const messagesApi = {
  edit: (messageId: string, content: string) =>
    api.patch(`/api/v1/messages/${messageId}`, { content }),

  delete: (messageId: string) =>
    api.delete(`/api/v1/messages/${messageId}`),

  updateStatus: (messageIds: string[], status: string) =>
    api.patch(`/api/v1/messages/${messageIds[0]}/status`, { messageIds, status }),
};
