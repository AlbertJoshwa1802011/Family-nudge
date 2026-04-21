import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret-key-for-vitest';

vi.mock('../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    session: {
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock('@family-nudge/crypto', () => ({
  HashService: {
    hashPassword: vi.fn((pw: string) => `salt:${pw}-hashed`),
    verifyPassword: vi.fn((pw: string, stored: string) => stored === `salt:${pw}-hashed`),
    generateToken: vi.fn(() => 'mock-token-123456'),
  },
}));

import { prisma } from '../lib/prisma';
import { HashService } from '@family-nudge/crypto';

describe('Auth Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Password Hashing', () => {
    it('should hash a password', () => {
      const hash = HashService.hashPassword('mypassword');
      expect(hash).toBe('salt:mypassword-hashed');
      expect(HashService.hashPassword).toHaveBeenCalledWith('mypassword');
    });

    it('should verify correct password', () => {
      const result = HashService.verifyPassword('mypassword', 'salt:mypassword-hashed');
      expect(result).toBe(true);
    });

    it('should reject incorrect password', () => {
      const result = HashService.verifyPassword('wrongpassword', 'salt:mypassword-hashed');
      expect(result).toBe(false);
    });
  });

  describe('JWT Token Generation', () => {
    it('should generate a valid JWT token', () => {
      const token = jwt.sign(
        { userId: 'user-1', email: 'test@example.com' },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' },
      );

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        email: string;
      };
      expect(decoded.userId).toBe('user-1');
      expect(decoded.email).toBe('test@example.com');
    });

    it('should reject an expired token', () => {
      const token = jwt.sign(
        { userId: 'user-1', email: 'test@example.com' },
        process.env.JWT_SECRET!,
        { expiresIn: '0s' },
      );

      expect(() => jwt.verify(token, process.env.JWT_SECRET!)).toThrow();
    });

    it('should reject a token with wrong secret', () => {
      const token = jwt.sign(
        { userId: 'user-1', email: 'test@example.com' },
        'wrong-secret',
        { expiresIn: '7d' },
      );

      expect(() => jwt.verify(token, process.env.JWT_SECRET!)).toThrow();
    });
  });

  describe('Token Utility', () => {
    it('should generate random tokens', () => {
      const token = HashService.generateToken(32);
      expect(token).toBe('mock-token-123456');
      expect(HashService.generateToken).toHaveBeenCalledWith(32);
    });
  });
});
