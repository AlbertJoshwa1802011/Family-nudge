import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pino } from 'pino';
import { authRouter } from './routes/auth';
import { familyRouter } from './routes/family';
import { reminderRouter } from './routes/reminders';
import { documentRouter } from './routes/documents';
import { policyRouter } from './routes/policies';
import { maintenanceRouter } from './routes/maintenance';
import { notificationRouter } from './routes/notifications';
import { errorHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/request-logger';
import { startScheduler } from './services/scheduler.service';
import { notificationService } from './services/notification.service';
import { getRedis } from './lib/redis';
import { prisma } from './lib/prisma';

const logger = pino({
  transport:
    process.env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
});

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(requestLogger(logger));

app.get('/health', async (_req, res) => {
  const checks: Record<string, string> = {};

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'connected';
  } catch {
    checks.database = 'disconnected';
  }

  const redis = getRedis();
  if (redis) {
    try {
      await redis.ping();
      checks.redis = 'connected';
    } catch {
      checks.redis = 'disconnected';
    }
  } else {
    checks.redis = 'not_configured';
  }

  checks.twilio = process.env.TWILIO_ACCOUNT_SID ? 'configured' : 'not_configured';
  checks.smtp = process.env.SMTP_HOST ? 'configured' : 'not_configured';
  checks.firebase = process.env.FIREBASE_PROJECT_ID ? 'configured' : 'not_configured';

  const allHealthy = checks.database === 'connected';

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
    services: checks,
    uptime: process.uptime(),
  });
});

app.use('/api/auth', authRouter);
app.use('/api/families', familyRouter);
app.use('/api/reminders', reminderRouter);
app.use('/api/documents', documentRouter);
app.use('/api/policies', policyRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/notifications', notificationRouter);

app.use(errorHandler(logger));

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`Family Nudge API running on port ${PORT}`);

    startScheduler();
    notificationService.startWorker().catch((err) => {
      logger.error(err, 'Failed to start notification worker');
    });
  });
}

export { app };
