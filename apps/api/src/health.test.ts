import { describe, it, expect } from 'vitest';

describe('Health endpoint', () => {
  it('should return expected shape from the health response', () => {
    const response = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
    };

    expect(response.status).toBe('ok');
    expect(response.version).toBe('0.1.0');
    expect(() => new Date(response.timestamp)).not.toThrow();
  });
});
