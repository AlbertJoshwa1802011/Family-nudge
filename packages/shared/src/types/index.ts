export type Role = "HEAD" | "ADULT" | "ELDER" | "CHILD";

export type EscalationChannel = "PUSH" | "WHATSAPP_TEXT" | "WHATSAPP_VOICE";

export type ReminderStatus = "ACTIVE" | "PAUSED" | "ARCHIVED";

export type DocumentCategory =
  | "IDENTITY"
  | "MEDICAL"
  | "FINANCIAL"
  | "EDUCATION"
  | "PROPERTY"
  | "WARRANTY"
  | "SUBSCRIPTION"
  | "OTHER";

export type DocumentAction =
  | "UPLOAD"
  | "DOWNLOAD"
  | "VIEW"
  | "DELETE"
  | "RENAME";
