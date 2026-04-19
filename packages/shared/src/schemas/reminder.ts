import { z } from "zod";

export const EscalationStepSchema = z.object({
  channel: z.enum(["PUSH", "WHATSAPP_TEXT", "WHATSAPP_VOICE"]),
  delayMin: z.number().int().min(0).max(24 * 60),
});
export type EscalationStep = z.infer<typeof EscalationStepSchema>;

export const ReminderCreateSchema = z.object({
  familyId: z.string().uuid(),
  targetUserId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  rrule: z.string().min(1),
  escalationRules: z.array(EscalationStepSchema).min(1).max(5),
  timezone: z.string().default("Asia/Kolkata"),
  urgent: z.boolean().default(false),
});
export type ReminderCreate = z.infer<typeof ReminderCreateSchema>;

export const ReminderAckSchema = z.object({
  instanceId: z.string().uuid(),
  channel: z.enum(["PUSH", "WHATSAPP_REPLY", "WEB", "MOBILE"]),
});
export type ReminderAck = z.infer<typeof ReminderAckSchema>;
