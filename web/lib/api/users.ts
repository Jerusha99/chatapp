import { api } from "./client";

export const usersApi = {
  getMe: () => api.get("/api/v1/users/me"),

  updateMe: (data: Record<string, unknown>) =>
    api.patch("/api/v1/users/me", data),

  getById: (id: string) => api.get(`/api/v1/users/${id}`),

  syncContacts: (phoneNumbers: string[]) =>
    api.post("/api/v1/users/sync-contacts", { phoneNumbers }),
};
