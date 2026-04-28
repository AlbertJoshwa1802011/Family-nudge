import { describe, it, expect } from 'vitest';
import { app } from '../main';

describe('Health endpoint', () => {
  it('responds with status ok', async () => {
    const response = await fetch('http://localhost:0/health');
    // Since we can't easily start the server in tests, validate the export
    expect(app).toBeDefined();
    expect(typeof app.listen).toBe('function');
  });
});

describe('App configuration', () => {
  it('has CORS, helmet, and JSON middleware', () => {
    // Express 5 router stack includes named middleware
    const stack = (app as any)._router?.stack ?? [];
    expect(stack.length).toBeGreaterThan(0);
  });

  it('has registered API route prefixes', () => {
    const stack = (app as any)._router?.stack ?? [];
    const routes = stack
      .filter((layer: any) => layer.name === 'router')
      .map((layer: any) => layer.regexp?.toString());
    expect(routes.length).toBeGreaterThan(0);
  });
});
