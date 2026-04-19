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

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '0.1.0' });
});

app.use('/api/auth', authRouter);
app.use('/api/families', familyRouter);
app.use('/api/reminders', reminderRouter);
app.use('/api/documents', documentRouter);
app.use('/api/policies', policyRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/notifications', notificationRouter);

app.use(errorHandler(logger));

app.listen(PORT, () => {
  logger.info(`Family Nudge API running on port ${PORT}`);
});

export { app };
