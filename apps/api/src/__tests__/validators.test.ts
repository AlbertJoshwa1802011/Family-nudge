import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const createReminderSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  category: z.string(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  frequency: z.enum(['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM']).default('ONCE'),
  channels: z.array(z.enum(['PUSH', 'SMS', 'WHATSAPP', 'CALL', 'EMAIL'])).default(['PUSH']),
  dueDate: z.string().datetime(),
  earlyNotificationDays: z.number().int().min(0).max(365).default(7),
  familyId: z.string(),
  assigneeIds: z.array(z.string()).optional(),
});

const createFamilySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

describe('Registration Validation', () => {
  it('should accept valid registration data', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    });
    expect(result.success).toBe(true);
  });

  it('should accept registration with phone', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = registerSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    });
    expect(result.success).toBe(false);
  });

  it('should reject short password', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: '1234567',
      firstName: 'John',
      lastName: 'Doe',
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty first name', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
      firstName: '',
      lastName: 'Doe',
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing fields', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
    });
    expect(result.success).toBe(false);
  });
});

describe('Login Validation', () => {
  it('should accept valid login data', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'invalid',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing password', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
    });
    expect(result.success).toBe(false);
  });
});

describe('Create Reminder Validation', () => {
  const validReminder = {
    title: 'Car Insurance Renewal',
    category: 'INSURANCE',
    priority: 'HIGH' as const,
    frequency: 'YEARLY' as const,
    channels: ['PUSH', 'SMS'] as ('PUSH' | 'SMS')[],
    dueDate: '2026-05-15T10:00:00.000Z',
    familyId: 'family-1',
    assigneeIds: ['user-1', 'user-2'],
  };

  it('should accept valid reminder data', () => {
    const result = createReminderSchema.safeParse(validReminder);
    expect(result.success).toBe(true);
  });

  it('should apply defaults for priority and frequency', () => {
    const result = createReminderSchema.safeParse({
      title: 'Test',
      category: 'HEALTH',
      dueDate: '2026-05-15T10:00:00.000Z',
      familyId: 'family-1',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.priority).toBe('MEDIUM');
      expect(result.data.frequency).toBe('ONCE');
      expect(result.data.channels).toEqual(['PUSH']);
      expect(result.data.earlyNotificationDays).toBe(7);
    }
  });

  it('should reject empty title', () => {
    const result = createReminderSchema.safeParse({
      ...validReminder,
      title: '',
    });
    expect(result.success).toBe(false);
  });

  it('should reject title over 200 chars', () => {
    const result = createReminderSchema.safeParse({
      ...validReminder,
      title: 'x'.repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid priority', () => {
    const result = createReminderSchema.safeParse({
      ...validReminder,
      priority: 'SUPER_HIGH',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid channel', () => {
    const result = createReminderSchema.safeParse({
      ...validReminder,
      channels: ['TELEGRAM'],
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid date format', () => {
    const result = createReminderSchema.safeParse({
      ...validReminder,
      dueDate: '2026-05-15',
    });
    expect(result.success).toBe(false);
  });

  it('should reject earlyNotificationDays over 365', () => {
    const result = createReminderSchema.safeParse({
      ...validReminder,
      earlyNotificationDays: 400,
    });
    expect(result.success).toBe(false);
  });

  it('should reject negative earlyNotificationDays', () => {
    const result = createReminderSchema.safeParse({
      ...validReminder,
      earlyNotificationDays: -1,
    });
    expect(result.success).toBe(false);
  });
});

describe('Create Family Validation', () => {
  it('should accept valid family name', () => {
    const result = createFamilySchema.safeParse({ name: 'The Doe Family' });
    expect(result.success).toBe(true);
  });

  it('should accept family with description', () => {
    const result = createFamilySchema.safeParse({
      name: 'The Doe Family',
      description: 'Our awesome family group',
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty name', () => {
    const result = createFamilySchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('should reject name over 100 chars', () => {
    const result = createFamilySchema.safeParse({ name: 'x'.repeat(101) });
    expect(result.success).toBe(false);
  });
});
