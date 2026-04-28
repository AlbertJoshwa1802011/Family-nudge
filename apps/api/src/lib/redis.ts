import Redis from 'ioredis';
import { pino } from 'pino';

const logger = pino({ name: 'redis' });

let redis: Redis | null = null;

export function getRedis(): Redis | null {
  if (redis) return redis;

  const url = process.env.REDIS_URL;
  if (!url) {
    logger.warn('REDIS_URL not configured — Redis features disabled');
    return null;
  }

  try {
    redis = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 5) return null;
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
    });

    redis.on('connect', () => logger.info('Redis connected'));
    redis.on('error', (err) => logger.error({ err: err.message }, 'Redis error'));

    return redis;
  } catch (err) {
    logger.error({ err }, 'Failed to initialize Redis');
    return null;
  }
}

export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
