import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error-handler';
import { authenticate, requireFamilyRole } from '../middleware/auth';

export const reminderRouter = Router();
reminderRouter.use(authenticate);

const createReminderSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  category: z.string(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  frequency: z.enum(['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM']).default('ONCE'),
  channels: z.array(z.enum(['PUSH', 'SMS', 'WHATSAPP', 'CALL', 'EMAIL'])).default(['PUSH']),
  dueDate: z.string().datetime(),
  customCronExpression: z.string().optional(),
  earlyNotificationDays: z.number().int().min(0).max(365).default(7),
  familyId: z.string(),
  assigneeIds: z.array(z.string()).optional(),
});

reminderRouter.post('/', async (req, res, next) => {
  try {
    const data = createReminderSchema.parse(req.body);

    const reminder = await prisma.reminder.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        frequency: data.frequency,
        channels: data.channels,
        dueDate: new Date(data.dueDate),
        nextDueDate: new Date(data.dueDate),
        customCronExpression: data.customCronExpression,
        earlyNotificationDays: data.earlyNotificationDays,
        createdById: req.user!.userId,
        familyId: data.familyId,
        assignees: data.assigneeIds
          ? { create: data.assigneeIds.map((userId) => ({ userId })) }
          : undefined,
      },
      include: {
        assignees: {
          include: { user: { select: { id: true, firstName: true, lastName: true } } },
        },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    res.status(201).json({ success: true, data: reminder });
  } catch (err) {
    next(err);
  }
});

reminderRouter.get('/family/:familyId', requireFamilyRole(), async (req, res, next) => {
  try {
    const { category, priority, completed } = req.query;

    const where: Record<string, unknown> = { familyId: req.params.familyId };
    if (category) where.category = category;
    if (priority) where.priority = priority;
    if (completed !== undefined) where.isCompleted = completed === 'true';

    const reminders = await prisma.reminder.findMany({
      where,
      include: {
        assignees: {
          include: { user: { select: { id: true, firstName: true, lastName: true } } },
        },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        linkedPolicy: { select: { id: true, name: true, type: true } },
      },
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
    });

    res.json({ success: true, data: reminders });
  } catch (err) {
    next(err);
  }
});

reminderRouter.get('/upcoming', async (req, res, next) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const reminders = await prisma.reminder.findMany({
      where: {
        isCompleted: false,
        dueDate: { lte: futureDate },
        family: {
          members: { some: { userId: req.user!.userId, isActive: true } },
        },
      },
      include: {
        family: { select: { id: true, name: true } },
        assignees: {
          include: { user: { select: { id: true, firstName: true, lastName: true } } },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    res.json({ success: true, data: reminders });
  } catch (err) {
    next(err);
  }
});

reminderRouter.patch('/:id/complete', async (req, res, next) => {
  try {
    const reminder = await prisma.reminder.update({
      where: { id: req.params.id },
      data: {
        isCompleted: true,
        completedAt: new Date(),
      },
    });

    res.json({ success: true, data: reminder });
  } catch (err) {
    next(err);
  }
});

reminderRouter.patch('/:id/snooze', async (req, res, next) => {
  try {
    const { hours } = req.body;
    const snoozedUntil = new Date();
    snoozedUntil.setHours(snoozedUntil.getHours() + (hours ?? 1));

    const reminder = await prisma.reminder.update({
      where: { id: req.params.id },
      data: { isSnoozed: true, snoozedUntil },
    });

    res.json({ success: true, data: reminder });
  } catch (err) {
    next(err);
  }
});

reminderRouter.delete('/:id', async (req, res, next) => {
  try {
    await prisma.reminder.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Reminder deleted' });
  } catch (err) {
    next(err);
  }
});
