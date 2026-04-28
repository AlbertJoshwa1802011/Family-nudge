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
import { prisma } from './lib/prisma';
import { initErrorTracking, errorTrackingMiddleware } from './lib/error-tracking';

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
    checks.database = 'ok';
  } catch {
    checks.database = 'unreachable';
  }

  checks.scheduler = process.env.DISABLE_SCHEDULER === 'true' ? 'disabled' : 'running';

  const allOk = checks.database === 'ok';
  res.status(allOk ? 200 : 503).json({
    status: allOk ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
    checks,
  });
});

app.use('/api/auth', authRouter);
app.use('/api/families', familyRouter);
app.use('/api/reminders', reminderRouter);
app.use('/api/documents', documentRouter);
app.use('/api/policies', policyRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/notifications', notificationRouter);

app.use(errorTrackingMiddleware());
app.use(errorHandler(logger));

initErrorTracking();

app.listen(PORT, () => {
  logger.info(`Family Nudge API running on port ${PORT}`);

  if (process.env.DISABLE_SCHEDULER !== 'true') {
    startScheduler();
    logger.info('Background scheduler started');
  }
});

export { app };
