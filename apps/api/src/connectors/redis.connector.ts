import { pino } from 'pino';

const logger = pino({ name: 'redis-connector' });

let redisClient: any = null;

export async function getRedisClient() {
  if (redisClient) return redisClient;

  const url = process.env.REDIS_URL;
  if (!url) {
    logger.warn('REDIS_URL not set — Redis features disabled');
    return null;
  }

  try {
    const { default: Redis } = await import('ioredis');
    redisClient = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        if (times > 5) return null;
        return Math.min(times * 200, 2000);
      },
    });

    redisClient.on('error', (err: Error) => {
      logger.error({ err }, 'Redis connection error');
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected');
    });

    return redisClient;
  } catch (err) {
    logger.error({ err }, 'Failed to create Redis client');
    return null;
  }
}

export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

export function isConfigured(): boolean {
  return !!process.env.REDIS_URL;
}
