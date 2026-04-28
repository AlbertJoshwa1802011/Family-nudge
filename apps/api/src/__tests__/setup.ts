import { beforeAll, afterAll } from 'vitest';

beforeAll(() => {
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.ENCRYPTION_MASTER_KEY =
    '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  process.env.NODE_ENV = 'test';
});

afterAll(async () => {
  // Allow pending handles to close
  await new Promise((resolve) => setTimeout(resolve, 100));
});
