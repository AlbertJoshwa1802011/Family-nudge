export const APP_NAME = 'Family Nudge';

export const MAX_FAMILY_MEMBERS = 20;
export const MAX_DOCUMENT_SIZE_MB = 50;
export const MAX_DOCUMENTS_PER_FAMILY = 500;

export const DEFAULT_EARLY_NOTIFICATION_DAYS = 7;
export const CRITICAL_EARLY_NOTIFICATION_DAYS = 30;

export const SUPPORTED_DOCUMENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
] as const;

export const NOTIFICATION_ESCALATION_MAP = {
  LOW: ['PUSH'],
  MEDIUM: ['PUSH', 'SMS'],
  HIGH: ['PUSH', 'SMS', 'WHATSAPP'],
  CRITICAL: ['PUSH', 'SMS', 'WHATSAPP', 'CALL'],
} as const;

export const PRIORITY_COLORS = {
  LOW: '#6B7280',
  MEDIUM: '#3B82F6',
  HIGH: '#F59E0B',
  CRITICAL: '#EF4444',
} as const;

export const CATEGORY_ICONS = {
  HEALTH: '🏥',
  FINANCE: '💰',
  INSURANCE: '🛡️',
  WARRANTY: '📋',
  MAINTENANCE: '🔧',
  SCHOOL: '🎓',
  DOCUMENTS: '📄',
  FAMILY: '👨‍👩‍👧‍👦',
  VEHICLE: '🚗',
  PETS: '🐾',
  HOUSEHOLD: '🏠',
  CUSTOM: '⭐',
} as const;
