import { CronJob } from 'cron';
import { prisma } from '../lib/prisma';
import { notificationService } from './notification.service';
import { pino } from 'pino';

const logger = pino({ name: 'scheduler' });

export function startScheduler(): void {
  // Check for due reminders every 15 minutes
  new CronJob('*/15 * * * *', checkDueReminders, null, true);

  // Check for expiring policies daily at 9 AM
  new CronJob('0 9 * * *', checkExpiringPolicies, null, true);

  // Check for overdue maintenance daily at 8 AM
  new CronJob('0 8 * * *', checkOverdueMaintenance, null, true);

  logger.info('Scheduler started — monitoring reminders, policies, and maintenance');
}

async function checkDueReminders(): Promise<void> {
  try {
    const now = new Date();

    const dueReminders = await prisma.reminder.findMany({
      where: {
        isCompleted: false,
        isSnoozed: false,
        OR: [
          { dueDate: { lte: now } },
          {
            nextDueDate: { lte: now },
          },
        ],
      },
      include: {
        assignees: { include: { user: true } },
        createdBy: true,
      },
    });

    for (const reminder of dueReminders) {
      const targets: Array<{ id: string }> =
        reminder.assignees.length > 0
          ? reminder.assignees.map((assignee: { user: { id: string } }) => assignee.user)
          : [reminder.createdBy];

      for (const user of targets) {
        await notificationService.sendToMultipleChannels(
          user.id,
          reminder.channels,
          `Reminder: ${reminder.title}`,
          reminder.description ?? `Your ${reminder.category.toLowerCase()} reminder is due.`,
          reminder.id,
        );
      }
    }

    if (dueReminders.length > 0) {
      logger.info({ count: dueReminders.length }, 'Processed due reminders');
    }
  } catch (error) {
    logger.error(error, 'Error checking due reminders');
  }
}

async function checkExpiringPolicies(): Promise<void> {
  try {
    const policies = await prisma.insurancePolicy.findMany({
      where: {
        status: { in: ['ACTIVE', 'EXPIRING_SOON'] },
        endDate: { gte: new Date() },
      },
      include: {
        family: {
          include: {
            members: {
              where: { role: { in: ['ADMIN', 'PARENT'] }, isActive: true },
              include: { user: true },
            },
          },
        },
      },
    });

    for (const policy of policies) {
      const daysUntilExpiry = Math.ceil(
        (policy.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      );

      if (daysUntilExpiry <= policy.earlyNotificationDays) {
        const shouldNotify =
          !policy.lastNotifiedAt ||
          Date.now() - policy.lastNotifiedAt.getTime() > 24 * 60 * 60 * 1000;

        if (shouldNotify) {
          for (const member of policy.family.members) {
            const channels = daysUntilExpiry <= 7 ? ['PUSH', 'SMS', 'WHATSAPP'] : ['PUSH'];
            await notificationService.sendToMultipleChannels(
              member.user.id,
              channels,
              `Policy Expiring: ${policy.name}`,
              `Your ${policy.type.toLowerCase()} policy with ${policy.provider} expires in ${daysUntilExpiry} days. Policy #${policy.policyNumber ?? 'N/A'}`,
            );
          }

          await prisma.insurancePolicy.update({
            where: { id: policy.id },
            data: {
              status: daysUntilExpiry <= 7 ? 'EXPIRING_SOON' : 'ACTIVE',
              lastNotifiedAt: new Date(),
            },
          });
        }
      }
    }
  } catch (error) {
    logger.error(error, 'Error checking expiring policies');
  }
}

async function checkOverdueMaintenance(): Promise<void> {
  try {
    const overdueItems = await prisma.maintenanceItem.findMany({
      where: {
        isActive: true,
        nextDueDate: { lte: new Date() },
      },
    });

    for (const item of overdueItems) {
      const members = await prisma.familyMember.findMany({
        where: {
          familyId: item.familyId,
          role: { in: ['ADMIN', 'PARENT'] },
          isActive: true,
        },
        include: { user: true },
      });

      for (const member of members) {
        await notificationService.sendToMultipleChannels(
          member.user.id,
          ['PUSH'],
          `Maintenance Overdue: ${item.name}`,
          `${item.name}${item.location ? ` (${item.location})` : ''} is overdue for maintenance.`,
        );
      }
    }

    if (overdueItems.length > 0) {
      logger.info({ count: overdueItems.length }, 'Notified about overdue maintenance items');
    }
  } catch (error) {
    logger.error(error, 'Error checking overdue maintenance');
  }
}
