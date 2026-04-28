import { pino } from 'pino';

const logger = pino({ name: 'queue-connector' });

let notificationQueue: any = null;
let maintenanceQueue: any = null;

export async function getNotificationQueue() {
  if (notificationQueue) return notificationQueue;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    logger.warn('REDIS_URL not set — Bull queue disabled, falling back to direct execution');
    return null;
  }

  try {
    const Bull = await import('bull');
    notificationQueue = new Bull.default('notifications', redisUrl, {
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 500,
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      },
    });
    logger.info('Notification queue initialized');
    return notificationQueue;
  } catch (err) {
    logger.error({ err }, 'Failed to create notification queue');
    return null;
  }
}

export async function getMaintenanceQueue() {
  if (maintenanceQueue) return maintenanceQueue;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return null;

  try {
    const Bull = await import('bull');
    maintenanceQueue = new Bull.default('maintenance', redisUrl, {
      defaultJobOptions: {
        removeOnComplete: 50,
        removeOnFail: 200,
        attempts: 2,
        backoff: { type: 'fixed', delay: 5000 },
      },
    });
    logger.info('Maintenance queue initialized');
    return maintenanceQueue;
  } catch (err) {
    logger.error({ err }, 'Failed to create maintenance queue');
    return null;
  }
}

export async function closeQueues(): Promise<void> {
  if (notificationQueue) {
    await notificationQueue.close();
    notificationQueue = null;
  }
  if (maintenanceQueue) {
    await maintenanceQueue.close();
    maintenanceQueue = null;
  }
}
