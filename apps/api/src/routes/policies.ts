import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error-handler';
import { authenticate, requireFamilyRole } from '../middleware/auth';

export const policyRouter = Router();
policyRouter.use(authenticate);

const createPolicySchema = z.object({
  name: z.string().min(1),
  type: z.string(),
  provider: z.string().min(1),
  policyNumber: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  premiumAmount: z.number().optional(),
  premiumFrequency: z.string().optional(),
  coverageDetails: z.string().optional(),
  earlyNotificationDays: z.number().int().min(1).max(365).default(30),
  familyId: z.string(),
  memberId: z.string().optional(),
  documentIds: z.array(z.string()).optional(),
});

policyRouter.post('/', async (req, res, next) => {
  try {
    const data = createPolicySchema.parse(req.body);

    const policy = await prisma.insurancePolicy.create({
      data: {
        name: data.name,
        type: data.type,
        provider: data.provider,
        policyNumber: data.policyNumber,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        premiumAmount: data.premiumAmount,
        premiumFrequency: data.premiumFrequency,
        coverageDetails: data.coverageDetails,
        earlyNotificationDays: data.earlyNotificationDays,
        familyId: data.familyId,
        memberId: data.memberId,
        documents: data.documentIds
          ? { connect: data.documentIds.map((id) => ({ id })) }
          : undefined,
      },
      include: {
        documents: { select: { id: true, name: true, category: true } },
      },
    });

    // Auto-create a reminder for this policy expiry
    await prisma.reminder.create({
      data: {
        title: `${data.name} - Renewal Due`,
        description: `Your ${data.type.toLowerCase()} policy with ${data.provider} is expiring. Policy #${data.policyNumber ?? 'N/A'}`,
        category: 'INSURANCE',
        priority: 'HIGH',
        frequency: 'ONCE',
        channels: ['PUSH', 'SMS'],
        dueDate: new Date(data.endDate),
        nextDueDate: new Date(data.endDate),
        earlyNotificationDays: data.earlyNotificationDays,
        createdById: req.user!.userId,
        familyId: data.familyId,
        linkedPolicyId: policy.id,
      },
    });

    res.status(201).json({ success: true, data: policy });
  } catch (err) {
    next(err);
  }
});

policyRouter.get('/family/:familyId', requireFamilyRole(), async (req, res, next) => {
  try {
    const { type, status } = req.query;
    const where: Record<string, unknown> = { familyId: req.params.familyId };
    if (type) where.type = type;
    if (status) where.status = status;

    const policies = await prisma.insurancePolicy.findMany({
      where,
      include: {
        documents: { select: { id: true, name: true, category: true } },
        reminders: { select: { id: true, title: true, dueDate: true, isCompleted: true } },
      },
      orderBy: { endDate: 'asc' },
    });

    // Enrich with computed status
    const enriched = policies.map((policy: (typeof policies)[number]) => {
      const now = new Date();
      const daysUntilExpiry = Math.ceil(
        (policy.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      let computedStatus = 'ACTIVE';
      if (daysUntilExpiry <= 0) computedStatus = 'EXPIRED';
      else if (daysUntilExpiry <= policy.earlyNotificationDays) computedStatus = 'EXPIRING_SOON';

      return { ...policy, computedStatus, daysUntilExpiry };
    });

    res.json({ success: true, data: enriched });
  } catch (err) {
    next(err);
  }
});

policyRouter.get('/expiring', async (req, res, next) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const policies = await prisma.insurancePolicy.findMany({
      where: {
        endDate: { lte: futureDate, gte: new Date() },
        family: {
          members: { some: { userId: req.user!.userId, isActive: true } },
        },
      },
      include: {
        family: { select: { id: true, name: true } },
      },
      orderBy: { endDate: 'asc' },
    });

    res.json({ success: true, data: policies });
  } catch (err) {
    next(err);
  }
});

policyRouter.put('/:id', async (req, res, next) => {
  try {
    const policy = await prisma.insurancePolicy.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json({ success: true, data: policy });
  } catch (err) {
    next(err);
  }
});

policyRouter.delete('/:id', async (req, res, next) => {
  try {
    await prisma.insurancePolicy.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Policy deleted' });
  } catch (err) {
    next(err);
  }
});
