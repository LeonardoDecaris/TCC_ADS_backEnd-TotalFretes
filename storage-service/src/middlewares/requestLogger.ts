import { NextFunction, Request, Response } from 'express';
import { logger } from '../config/logger';

export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  res.on('finish', () => {
    logger.info(`${req.method} ${req.originalUrl}`, { statusCode: res.statusCode });
  });
  next();
}
