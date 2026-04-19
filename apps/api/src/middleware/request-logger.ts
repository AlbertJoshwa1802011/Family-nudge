import type { Request, Response, NextFunction } from 'express';
import type { Logger } from 'pino';

export function requestLogger(logger: Logger) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const start = Date.now();
    _res.on('finish', () => {
      logger.info({
        method: req.method,
        url: req.originalUrl,
        statusCode: _res.statusCode,
        durationMs: Date.now() - start,
      });
    });
    next();
  };
}
