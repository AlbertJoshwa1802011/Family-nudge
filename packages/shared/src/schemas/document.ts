import { z } from "zod";

export const DocumentCategorySchema = z.enum([
  "IDENTITY",
  "MEDICAL",
  "FINANCIAL",
  "EDUCATION",
  "PROPERTY",
  "WARRANTY",
  "SUBSCRIPTION",
  "OTHER",
]);

export const DocumentUploadMetadataSchema = z.object({
  familyId: z.string().uuid(),
  title: z.string().min(1).max(200),
  category: DocumentCategorySchema,
  mimeType: z.string().min(1).max(200),
  sizeBytes: z.number().int().min(0),
  iv: z.string().min(1),        // base64
  authTag: z.string().min(1),   // base64
  encryptedDek: z.string().min(1), // base64 (DEK wrapped by family KEK client-side)
});
export type DocumentUploadMetadata = z.infer<typeof DocumentUploadMetadataSchema>;
