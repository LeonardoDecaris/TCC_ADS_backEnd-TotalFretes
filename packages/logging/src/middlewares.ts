import { NextFunction, Request, Response } from 'express';
import type winston from 'winston';
import { REQUEST_ID_HEADER, requestContext, resolveRequestId } from './correlation';

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId = resolveRequestId(req);
  res.locals.requestId = requestId;
  res.setHeader(REQUEST_ID_HEADER, requestId);
  requestContext.run({ requestId }, () => next());
}

export function createRequestLoggerMiddleware(logger: winston.Logger) {
  return function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
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
  };
}
