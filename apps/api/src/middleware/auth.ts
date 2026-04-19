import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error-handler';

export interface AuthPayload {
  userId: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError(401, 'Authentication required'));
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token'));
  }
}

export function requireFamilyRole(...roles: string[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Authentication required'));
    }

    const { prisma } = await import('../lib/prisma');
    const familyId = req.params.familyId ?? req.body?.familyId;

    if (!familyId) {
      return next(new AppError(400, 'Family ID is required'));
    }

    const member = await prisma.familyMember.findUnique({
      where: {
        userId_familyId: {
          userId: req.user.userId,
          familyId,
        },
      },
    });

    if (!member || !member.isActive) {
      return next(new AppError(403, 'You are not a member of this family'));
    }

    if (roles.length > 0 && !roles.includes(member.role)) {
      return next(new AppError(403, 'Insufficient permissions'));
    }

    next();
  };
}
