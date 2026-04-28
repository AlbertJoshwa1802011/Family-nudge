import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pino } from 'pino';
import { errorHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/request-logger';

export const logger = pino({
  transport:
    process.env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
});

type CreateAppOptions = {
  includeApiRoutes?: boolean;
};

export function createApp(options: CreateAppOptions = {}): Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*', credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(requestLogger(logger));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '0.1.0' });
  });

  if (options.includeApiRoutes !== false) {
    void registerApiRoutes(app);
  }

  app.use(errorHandler(logger));
  return app;
}

export async function registerApiRoutes(app: Express) {
  const [
    { authRouter },
    { familyRouter },
    { reminderRouter },
    { documentRouter },
    { policyRouter },
    { maintenanceRouter },
    { notificationRouter },
  ] = await Promise.all([
    import('./routes/auth'),
    import('./routes/family'),
    import('./routes/reminders'),
    import('./routes/documents'),
    import('./routes/policies'),
    import('./routes/maintenance'),
    import('./routes/notifications'),
  ]);

  app.use('/api/auth', authRouter);
  app.use('/api/families', familyRouter);
  app.use('/api/reminders', reminderRouter);
  app.use('/api/documents', documentRouter);
  app.use('/api/policies', policyRouter);
  app.use('/api/maintenance', maintenanceRouter);
  app.use('/api/notifications', notificationRouter);
}

export const app = createApp({ includeApiRoutes: false });
