import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { getConnectorStatus } from '../connectors';
import { pino } from 'pino';

const logger = pino({ name: 'health' });

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '0.1.0',
    uptime: process.uptime(),
  });
});

healthRouter.get('/ready', async (_req, res) => {
  const checks: Record<string, { status: string; latencyMs?: number; error?: string }> = {};
  let healthy = true;

  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: 'ok', latencyMs: Date.now() - dbStart };
  } catch (err) {
    healthy = false;
    checks.database = {
      status: 'error',
      latencyMs: Date.now() - dbStart,
      error: err instanceof Error ? err.message : 'Unknown',
    };
    logger.error({ err }, 'Database health check failed');
  }

  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    const redisStart = Date.now();
    try {
      const { default: Redis } = await import('ioredis');
      const redis = new Redis(redisUrl, { lazyConnect: true, connectTimeout: 3000 });
      await redis.ping();
      checks.redis = { status: 'ok', latencyMs: Date.now() - redisStart };
      await redis.quit();
    } catch (err) {
      healthy = false;
      checks.redis = {
        status: 'error',
        latencyMs: Date.now() - redisStart,
        error: err instanceof Error ? err.message : 'Unknown',
      };
      logger.error({ err }, 'Redis health check failed');
    }
  } else {
    checks.redis = { status: 'not_configured' };
  }

  checks.notifications = {
    status: 'ok',
    ...getNotificationConnectorStatus(),
  };

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ready' : 'degraded',
    timestamp: new Date().toISOString(),
    checks,
  });
});

healthRouter.get('/connectors', (_req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    connectors: getConnectorStatus(),
  });
});

function getNotificationConnectorStatus() {
  return {
    push_fcm: process.env.FIREBASE_PROJECT_ID ? 'configured' : 'not_configured',
    sms_twilio: process.env.TWILIO_ACCOUNT_SID ? 'configured' : 'not_configured',
    whatsapp_twilio: process.env.TWILIO_WHATSAPP_FROM ? 'configured' : 'not_configured',
    voice_twilio: process.env.TWILIO_PHONE_FROM ? 'configured' : 'not_configured',
    email_smtp: process.env.SMTP_HOST ? 'configured' : 'not_configured',
  };
}
