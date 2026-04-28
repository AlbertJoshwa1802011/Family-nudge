import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../main';

vi.mock('../lib/prisma', () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    session: {
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    familyMember: {
      findUnique: vi.fn(),
    },
  };
  return { prisma: mockPrisma };
});

const { prisma } = await import('../lib/prisma');

describe('Auth routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('returns 400 for invalid body', async () => {
      const res = await request(app).post('/api/auth/register').send({});
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('returns 409 if email already registered', async () => {
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'existing',
        email: 'test@example.com',
      });

      const res = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      });

      expect(res.status).toBe(409);
    });
  });

  describe('POST /api/auth/login', () => {
    it('returns 400 for empty body', async () => {
      const res = await request(app).post('/api/auth/login').send({});
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('returns 401 for non-existent user', async () => {
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const res = await request(app).post('/api/auth/login').send({
        email: 'nobody@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });
});
