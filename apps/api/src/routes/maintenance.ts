import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error-handler';
import { authenticate } from '../middleware/auth';

export const maintenanceRouter = Router();
maintenanceRouter.use(authenticate);

const createItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string(),
  location: z.string().optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM']),
  nextDueDate: z.string().datetime(),
  estimatedCost: z.number().optional(),
  notes: z.string().optional(),
  familyId: z.string(),
});

const logMaintenanceSchema = z.object({
  cost: z.number().optional(),
  notes: z.string().optional(),
  performedBy: z.string().optional(),
});

maintenanceRouter.post('/', async (req, res, next) => {
  try {
    const data = createItemSchema.parse(req.body);

    const item = await prisma.maintenanceItem.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        location: data.location,
        frequency: data.frequency,
        nextDueDate: new Date(data.nextDueDate),
        estimatedCost: data.estimatedCost,
        notes: data.notes,
        familyId: data.familyId,
      },
    });

    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
});

maintenanceRouter.get('/family/:familyId', async (req, res, next) => {
  try {
    const items = await prisma.maintenanceItem.findMany({
      where: { familyId: req.params.familyId, isActive: true },
      include: {
        logs: { take: 5, orderBy: { performedAt: 'desc' } },
      },
      orderBy: { nextDueDate: 'asc' },
    });

    const enriched = items.map((item: (typeof items)[number]) => {
      const now = new Date();
      const daysUntilDue = Math.ceil(
        (item.nextDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );
      let urgency: 'overdue' | 'due_soon' | 'upcoming' | 'ok' = 'ok';
      if (daysUntilDue < 0) urgency = 'overdue';
      else if (daysUntilDue <= 3) urgency = 'due_soon';
      else if (daysUntilDue <= 7) urgency = 'upcoming';

      return { ...item, daysUntilDue, urgency };
    });

    res.json({ success: true, data: enriched });
  } catch (err) {
    next(err);
  }
});

maintenanceRouter.post('/:id/log', async (req, res, next) => {
  try {
    const data = logMaintenanceSchema.parse(req.body);
    const item = await prisma.maintenanceItem.findUnique({ where: { id: req.params.id } });
    if (!item) throw new AppError(404, 'Maintenance item not found');

    const log = await prisma.maintenanceLog.create({
      data: {
        itemId: item.id,
        cost: data.cost,
        notes: data.notes,
        performedBy: data.performedBy ?? req.user!.userId,
      },
    });

    // Calculate next due date based on frequency
    const nextDue = new Date();
    switch (item.frequency) {
      case 'DAILY': nextDue.setDate(nextDue.getDate() + 1); break;
      case 'WEEKLY': nextDue.setDate(nextDue.getDate() + 7); break;
      case 'MONTHLY': nextDue.setMonth(nextDue.getMonth() + 1); break;
      case 'QUARTERLY': nextDue.setMonth(nextDue.getMonth() + 3); break;
      case 'YEARLY': nextDue.setFullYear(nextDue.getFullYear() + 1); break;
    }

    await prisma.maintenanceItem.update({
      where: { id: item.id },
      data: { lastDoneAt: new Date(), nextDueDate: nextDue },
    });

    res.status(201).json({ success: true, data: log });
  } catch (err) {
    next(err);
  }
});

maintenanceRouter.delete('/:id', async (req, res, next) => {
  try {
    await prisma.maintenanceItem.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    res.json({ success: true, message: 'Maintenance item deactivated' });
  } catch (err) {
    next(err);
  }
});
