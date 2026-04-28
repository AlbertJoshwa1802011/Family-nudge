import { describe, it, expect, vi } from 'vitest';
import { AppError, errorHandler } from './error-handler';
import type { Request, Response, NextFunction } from 'express';
import type { Logger } from 'pino';

function mockResponse() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

describe('AppError', () => {
  it('creates an error with status code and message', () => {
    const err = new AppError(404, 'Not found');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Not found');
    expect(err.isOperational).toBe(true);
  });

  it('supports non-operational errors', () => {
    const err = new AppError(500, 'Internal', false);
    expect(err.isOperational).toBe(false);
  });

  it('is an instance of Error', () => {
    const err = new AppError(400, 'Bad request');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
  });
});

describe('errorHandler', () => {
  const logger = { error: vi.fn() } as unknown as Logger;
  const handler = errorHandler(logger);
  const req = {} as Request;
  const next = vi.fn() as NextFunction;

  it('handles AppError with correct status and message', () => {
    const res = mockResponse();
    handler(new AppError(422, 'Validation failed'), req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Validation failed',
    });
  });

  it('handles generic errors as 500 in production', () => {
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const res = mockResponse();
    handler(new Error('Something broke'), req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Internal server error',
    });

    process.env.NODE_ENV = original;
  });

  it('exposes error message in non-production', () => {
    process.env.NODE_ENV = 'test';
    const res = mockResponse();
    handler(new Error('Debug info'), req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Debug info',
    });
  });
});
