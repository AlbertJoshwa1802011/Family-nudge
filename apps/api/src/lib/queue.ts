import Bull from 'bull';
import { pino } from 'pino';

const logger = pino({ name: 'queue' });

export type NotificationJobData = {
  userId: string;
  reminderId?: string;
  channel: string;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
};

let notificationQueue: Bull.Queue<NotificationJobData> | null = null;

export function getNotificationQueue(): Bull.Queue<NotificationJobData> | null {
  if (notificationQueue) return notificationQueue;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    logger.warn('REDIS_URL not set — notification queue disabled (using direct dispatch)');
    return null;
  }

  try {
    notificationQueue = new Bull<NotificationJobData>('notifications', redisUrl, {
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    });

    notificationQueue.on('failed', (job, err) => {
      logger.error(
        { jobId: job.id, channel: job.data.channel, error: err.message },
        'Notification job failed',
      );
    });

    notificationQueue.on('completed', (job) => {
      logger.debug({ jobId: job.id, channel: job.data.channel }, 'Notification job completed');
    });

    logger.info('Notification queue initialized');
    return notificationQueue;
  } catch (err) {
    logger.error({ err }, 'Failed to create notification queue');
    return null;
  }
}

export async function closeQueues(): Promise<void> {
  if (notificationQueue) {
    await notificationQueue.close();
    notificationQueue = null;
  }
}
