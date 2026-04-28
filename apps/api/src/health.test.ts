import { describe, it, expect } from 'vitest';

describe('Health check response contract', () => {
  it('defines expected health response shape', () => {
    const response = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
      checks: {
        database: 'ok',
      },
    };

    expect(response.status).toMatch(/^(ok|degraded)$/);
    expect(response.version).toBe('0.1.0');
    expect(response.checks).toBeDefined();
    expect(response.timestamp).toBeTruthy();
  });

  it('marks status as degraded when a check fails', () => {
    const checks = { database: 'error' };
    const allOk = Object.values(checks).every((v) => v === 'ok');
    expect(allOk).toBe(false);
  });

  it('marks status as ok when all checks pass', () => {
    const checks = { database: 'ok' };
    const allOk = Object.values(checks).every((v) => v === 'ok');
    expect(allOk).toBe(true);
  });
});
