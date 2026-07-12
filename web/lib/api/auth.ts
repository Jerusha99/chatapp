import { api } from "./client";

export const authApi = {
  requestOtp: (phone: string) =>
    api.post("/api/v1/auth/phone/request-otp", { phone }),

  verifyOtp: (phone: string, token: string) =>
    api.post("/api/v1/auth/phone/verify", { phone, token }),

  signup: (email: string, password: string, displayName: string) =>
    api.post("/api/v1/auth/email/signup", { email, password, displayName }),

  login: (email: string, password: string) =>
    api.post("/api/v1/auth/email/login", { email, password }),

  refresh: () => api.post("/api/v1/auth/refresh"),

  logout: () => api.post("/api/v1/auth/logout"),
};
