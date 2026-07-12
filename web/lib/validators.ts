import { z } from "zod";

export const requestOtpSchema = z.object({
  phone: z.string().min(8).max(20),
});

export const verifyOtpSchema = z.object({
  phone: z.string().min(8).max(20),
  token: z.string().length(6),
});

export const emailSignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
  displayName: z.string().min(2).max(50),
});

export const emailLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createChatSchema = z.object({
  type: z.enum(["direct", "group"]),
  name: z.string().min(1).max(100).optional(),
  memberIds: z.array(z.string().uuid()).min(1).max(100),
});

export const sendMessageSchema = z.object({
  type: z.enum(["text", "image", "video", "voice", "document", "location", "contact"]),
  content: z.string().min(1).max(10000),
  replyToId: z.string().uuid().optional(),
  mediaUrl: z.string().url().optional(),
  mediaWidth: z.number().int().positive().optional(),
  mediaHeight: z.number().int().positive().optional(),
  mediaDuration: z.number().positive().optional(),
  mediaSize: z.number().int().positive().optional(),
  mediaMimeType: z.string().optional(),
  locationLat: z.number().optional(),
  locationLng: z.number().optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
});

export const editMessageSchema = z.object({
  content: z.string().min(1).max(10000),
});

export const syncContactsSchema = z.object({
  phoneNumbers: z.array(z.string().min(1)).max(1000),
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  bio: z.string().max(300).optional(),
  avatarUrl: z.string().url().optional(),
  phone: z.string().max(20).optional(),
});

export const updateMessageStatusSchema = z.object({
  status: z.enum(["sent", "delivered", "read"]),
  messageIds: z.array(z.string().uuid()).min(1).max(100),
});

export const addMemberSchema = z.object({
  userId: z.string().uuid(),
});

export type RequestOtpInput = z.infer<typeof requestOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type EmailSignupInput = z.infer<typeof emailSignupSchema>;
export type EmailLoginInput = z.infer<typeof emailLoginSchema>;
export type CreateChatInput = z.infer<typeof createChatSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type EditMessageInput = z.infer<typeof editMessageSchema>;
export type SyncContactsInput = z.infer<typeof syncContactsSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateMessageStatusInput = z.infer<typeof updateMessageStatusSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
