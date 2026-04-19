import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { HashService } from '@family-nudge/crypto';
import { AppError } from '../middleware/error-handler';
import { authenticate, requireFamilyRole } from '../middleware/auth';

export const familyRouter = Router();
familyRouter.use(authenticate);

const createFamilySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'PARENT', 'MEMBER', 'CHILD', 'VIEWER']).default('MEMBER'),
});

familyRouter.post('/', async (req, res, next) => {
  try {
    const data = createFamilySchema.parse(req.body);
    const inviteCode = HashService.generateToken(6).toUpperCase().slice(0, 8);

    const family = await prisma.family.create({
      data: {
        name: data.name,
        description: data.description,
        inviteCode,
        members: {
          create: {
            userId: req.user!.userId,
            role: 'ADMIN',
          },
        },
      },
      include: { members: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } } },
    });

    res.status(201).json({ success: true, data: family });
  } catch (err) {
    next(err);
  }
});

familyRouter.get('/', async (req, res, next) => {
  try {
    const families = await prisma.family.findMany({
      where: {
        members: { some: { userId: req.user!.userId, isActive: true } },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          },
        },
        _count: { select: { reminders: true, documents: true, policies: true } },
      },
    });

    res.json({ success: true, data: families });
  } catch (err) {
    next(err);
  }
});

familyRouter.get('/:familyId', requireFamilyRole(), async (req, res, next) => {
  try {
    const family = await prisma.family.findUnique({
      where: { id: req.params.familyId },
      include: {
        members: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatarUrl: true } },
          },
        },
        _count: { select: { reminders: true, documents: true, policies: true } },
      },
    });

    if (!family) throw new AppError(404, 'Family not found');
    res.json({ success: true, data: family });
  } catch (err) {
    next(err);
  }
});

familyRouter.post('/:familyId/invite', requireFamilyRole('ADMIN', 'PARENT'), async (req, res, next) => {
  try {
    const data = inviteMemberSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });

    if (!user) throw new AppError(404, 'User not found. They need to register first.');

    const existing = await prisma.familyMember.findUnique({
      where: { userId_familyId: { userId: user.id, familyId: req.params.familyId } },
    });

    if (existing) throw new AppError(409, 'User is already a member of this family');

    const member = await prisma.familyMember.create({
      data: {
        userId: user.id,
        familyId: req.params.familyId,
        role: data.role,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    res.status(201).json({ success: true, data: member });
  } catch (err) {
    next(err);
  }
});

familyRouter.post('/join', async (req, res, next) => {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode) throw new AppError(400, 'Invite code is required');

    const family = await prisma.family.findUnique({ where: { inviteCode } });
    if (!family) throw new AppError(404, 'Invalid invite code');

    const existing = await prisma.familyMember.findUnique({
      where: { userId_familyId: { userId: req.user!.userId, familyId: family.id } },
    });
    if (existing) throw new AppError(409, 'You are already a member');

    const member = await prisma.familyMember.create({
      data: {
        userId: req.user!.userId,
        familyId: family.id,
        role: 'MEMBER',
      },
    });

    res.status(201).json({ success: true, data: { family, member } });
  } catch (err) {
    next(err);
  }
});
