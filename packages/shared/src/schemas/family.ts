import { z } from "zod";

export const FamilyCreateSchema = z.object({
  name: z.string().min(1).max(100),
});
export type FamilyCreate = z.infer<typeof FamilyCreateSchema>;

export const FamilyJoinSchema = z.object({
  inviteCode: z.string().min(6).max(32),
});
export type FamilyJoin = z.infer<typeof FamilyJoinSchema>;

export const MemberRoleSchema = z.enum(["HEAD", "ADULT", "ELDER", "CHILD"]);
export type MemberRole = z.infer<typeof MemberRoleSchema>;
