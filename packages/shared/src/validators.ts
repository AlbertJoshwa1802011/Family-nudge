import { MAX_DOCUMENT_SIZE_MB, SUPPORTED_DOCUMENT_TYPES } from './constants';

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  return /^\+?[1-9]\d{7,14}$/.test(phone.replace(/[\s\-()]/g, ''));
}

export function isValidDocumentType(mimeType: string): boolean {
  return (SUPPORTED_DOCUMENT_TYPES as readonly string[]).includes(mimeType);
}

export function isValidDocumentSize(sizeInBytes: number): boolean {
  return sizeInBytes <= MAX_DOCUMENT_SIZE_MB * 1024 * 1024;
}

export function isDateInFuture(date: string | Date): boolean {
  return new Date(date) > new Date();
}

export function daysUntil(date: string | Date): number {
  const target = new Date(date);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function isExpiringSoon(date: string | Date, thresholdDays: number): boolean {
  const days = daysUntil(date);
  return days > 0 && days <= thresholdDays;
}
