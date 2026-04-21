import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { AppError, errorHandler } from '../middleware/error-handler';

process.env.JWT_SECRET = 'test-secret-key-for-vitest';

describe('Auth Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = { headers: {} };
    mockRes = {};
    mockNext = vi.fn();
  });

  it('should reject requests without Authorization header', () => {
    authenticate(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    const err = (mockNext as ReturnType<typeof vi.fn>).mock.calls[0][0] as AppError;
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe('Authentication required');
  });

  it('should reject requests with invalid Bearer format', () => {
    mockReq.headers = { authorization: 'Basic some-token' };
    authenticate(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
  });

  it('should reject requests with invalid tokens', () => {
    mockReq.headers = { authorization: 'Bearer invalid-token' };
    authenticate(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    const err = (mockNext as ReturnType<typeof vi.fn>).mock.calls[0][0] as AppError;
    expect(err.message).toBe('Invalid or expired token');
  });

  it('should accept valid tokens and set req.user', () => {
    const token = jwt.sign(
      { userId: 'user-1', email: 'test@example.com' },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' },
    );

    mockReq.headers = { authorization: `Bearer ${token}` };
    authenticate(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
    expect(mockReq.user).toBeDefined();
    expect(mockReq.user?.userId).toBe('user-1');
    expect(mockReq.user?.email).toBe('test@example.com');
  });
});

describe('Error Handler', () => {
  it('should handle AppError with correct status code', () => {
    const logger = { error: vi.fn() } as any;
    const handler = errorHandler(logger);

    const err = new AppError(400, 'Bad request');
    const mockReq = {} as Request;
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const mockNext = vi.fn() as NextFunction;

    handler(err, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: 'Bad request',
    });
  });

  it('should handle unexpected errors with 500', () => {
    const logger = { error: vi.fn() } as any;
    const handler = errorHandler(logger);

    const err = new Error('Unexpected failure');
    const mockReq = {} as Request;
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const mockNext = vi.fn() as NextFunction;

    handler(err, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  it('should mark AppError as operational', () => {
    const err = new AppError(404, 'Not found');
    expect(err.isOperational).toBe(true);
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Not found');
  });
});
