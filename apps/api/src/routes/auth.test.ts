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

describe('Auth validation schemas', () => {
  describe('registerSchema', () => {
    it('accepts valid registration data', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'securepass123',
        firstName: 'John',
        lastName: 'Doe',
      });
      expect(result.success).toBe(true);
    });

    it('accepts registration with optional phone', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'securepass123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const result = registerSchema.safeParse({
        email: 'not-an-email',
        password: 'securepass123',
        firstName: 'John',
        lastName: 'Doe',
      });
      expect(result.success).toBe(false);
    });

    it('rejects short password', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'short',
        firstName: 'John',
        lastName: 'Doe',
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty firstName', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'securepass123',
        firstName: '',
        lastName: 'Doe',
      });
      expect(result.success).toBe(false);
    });

    it('rejects missing required fields', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('accepts valid login data', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'any-password',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const result = loginSchema.safeParse({
        email: 'bad',
        password: 'any-password',
      });
      expect(result.success).toBe(false);
    });

    it('rejects missing password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
      });
      expect(result.success).toBe(false);
    });
  });
});
