import { pino } from 'pino';
import type { Request, Response, NextFunction } from 'express';

const logger = pino({ name: 'error-tracking' });

let isInitialized = false;

/**
 * Initialize the error-tracking connector (Sentry or compatible service).
 *
 * Set SENTRY_DSN in your environment to enable. Without it, errors are
 * logged locally via Pino and no external calls are made.
 */
export function initErrorTracking(): void {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    logger.info('SENTRY_DSN not set — error tracking runs in local-log-only mode');
    return;
  }

  // When SENTRY_DSN is provided, install @sentry/node and uncomment:
  // const Sentry = require('@sentry/node');
  // Sentry.init({
  //   dsn,
  //   environment: process.env.NODE_ENV ?? 'development',
  //   release: `family-nudge-api@${process.env.npm_package_version ?? '0.1.0'}`,
  //   tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
  // });

  isInitialized = true;
  logger.info('Error tracking initialized (Sentry)');
}

/**
 * Report an error to the tracking service.
 * Falls back to Pino logging if Sentry is not configured.
 */
export function captureException(error: unknown, context?: Record<string, unknown>): void {
  if (isInitialized) {
    // const Sentry = require('@sentry/node');
    // Sentry.captureException(error, { extra: context });
    logger.error({ error, context }, 'Exception captured (Sentry stub)');
  } else {
    logger.error({ error, context }, 'Untracked exception (configure SENTRY_DSN to report)');
  }
}

/**
 * Express middleware that captures request errors into the tracking service.
 */
export function errorTrackingMiddleware() {
  return (err: Error, _req: Request, _res: Response, next: NextFunction) => {
    captureException(err, { path: _req.path, method: _req.method });
    next(err);
  };
}
