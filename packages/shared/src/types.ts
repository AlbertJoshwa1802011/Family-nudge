// ─── Reminder Types ───

export enum ReminderPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum NotificationChannel {
  PUSH = 'PUSH',
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP',
  CALL = 'CALL',
  EMAIL = 'EMAIL',
}

export enum ReminderFrequency {
  ONCE = 'ONCE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
  CUSTOM = 'CUSTOM',
}

export enum ReminderCategory {
  HEALTH = 'HEALTH',
  FINANCE = 'FINANCE',
  INSURANCE = 'INSURANCE',
  WARRANTY = 'WARRANTY',
  MAINTENANCE = 'MAINTENANCE',
  SCHOOL = 'SCHOOL',
  DOCUMENTS = 'DOCUMENTS',
  FAMILY = 'FAMILY',
  VEHICLE = 'VEHICLE',
  PETS = 'PETS',
  HOUSEHOLD = 'HOUSEHOLD',
  CUSTOM = 'CUSTOM',
}

// ─── Document Types ───

export enum DocumentCategory {
  IDENTITY = 'IDENTITY',
  INSURANCE = 'INSURANCE',
  MEDICAL = 'MEDICAL',
  FINANCIAL = 'FINANCIAL',
  EDUCATION = 'EDUCATION',
  PROPERTY = 'PROPERTY',
  VEHICLE = 'VEHICLE',
  WARRANTY = 'WARRANTY',
  LEGAL = 'LEGAL',
  OTHER = 'OTHER',
}

export enum AuditAction {
  UPLOAD = 'UPLOAD',
  DOWNLOAD = 'DOWNLOAD',
  VIEW = 'VIEW',
  DELETE = 'DELETE',
  SHARE = 'SHARE',
  UPDATE = 'UPDATE',
}

// ─── Family Types ───

export enum FamilyRole {
  ADMIN = 'ADMIN',
  PARENT = 'PARENT',
  MEMBER = 'MEMBER',
  CHILD = 'CHILD',
  VIEWER = 'VIEWER',
}

// ─── Insurance/Warranty Types ───

export enum PolicyType {
  HEALTH = 'HEALTH',
  LIFE = 'LIFE',
  AUTO = 'AUTO',
  HOME = 'HOME',
  TRAVEL = 'TRAVEL',
  APPLIANCE_WARRANTY = 'APPLIANCE_WARRANTY',
  ELECTRONICS_WARRANTY = 'ELECTRONICS_WARRANTY',
  EXTENDED_WARRANTY = 'EXTENDED_WARRANTY',
  OTHER = 'OTHER',
}

export enum PolicyStatus {
  ACTIVE = 'ACTIVE',
  EXPIRING_SOON = 'EXPIRING_SOON',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  PENDING_RENEWAL = 'PENDING_RENEWAL',
}

// ─── API Response Types ───

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// ─── DTO Interfaces ───

export interface CreateReminderDto {
  title: string;
  description?: string;
  category: ReminderCategory;
  priority: ReminderPriority;
  channels: NotificationChannel[];
  frequency: ReminderFrequency;
  dueDate: string;
  customCronExpression?: string;
  earlyNotificationDays?: number;
  assigneeIds?: string[];
}

export interface CreateFamilyDto {
  name: string;
}

export interface InviteMemberDto {
  email: string;
  phone?: string;
  role: FamilyRole;
}

export interface UploadDocumentDto {
  name: string;
  category: DocumentCategory;
  description?: string;
  tags?: string[];
  familyMemberId?: string;
}

export interface CreatePolicyDto {
  name: string;
  type: PolicyType;
  provider: string;
  policyNumber?: string;
  startDate: string;
  endDate: string;
  premiumAmount?: number;
  premiumFrequency?: ReminderFrequency;
  coverageDetails?: string;
  earlyNotificationDays?: number;
  documentIds?: string[];
  familyMemberId?: string;
}
