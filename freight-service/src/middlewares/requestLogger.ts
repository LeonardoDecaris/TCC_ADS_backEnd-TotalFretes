import { NextFunction, Request, Response } from 'express';
import { logger } from '../config/logger';

export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const statusCode = res.statusCode;
    const durationMs = Date.now() - start;
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

    logger.log(level, `${req.method} ${req.originalUrl}`, {
      statusCode,
      durationMs,
      requestId: res.locals.requestId,
      method: req.method,
      path: req.originalUrl,
    });
  });

  next();
}
