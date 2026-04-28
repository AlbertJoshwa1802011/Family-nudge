import { beforeAll, afterAll } from 'vitest';

beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-jwt-secret';
  process.env.ENCRYPTION_MASTER_KEY =
    process.env.ENCRYPTION_MASTER_KEY ??
    '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
});

afterAll(async () => {
  const { prisma } = await import('../lib/prisma');
  await prisma.$disconnect();
});
