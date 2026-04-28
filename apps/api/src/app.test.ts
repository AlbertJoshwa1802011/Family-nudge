import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './app';

describe('app health endpoint', () => {
  it('returns service health metadata', async () => {
    const app = createApp({ includeApiRoutes: false });
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'ok',
      version: '0.1.0',
    });
    expect(typeof response.body.timestamp).toBe('string');
  });
});
