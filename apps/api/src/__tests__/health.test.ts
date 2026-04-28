import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../main';

describe('Health endpoint', () => {
  it('GET /health returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: 'ok',
      version: '0.1.0',
    });
    expect(res.body.timestamp).toBeDefined();
  });
});
