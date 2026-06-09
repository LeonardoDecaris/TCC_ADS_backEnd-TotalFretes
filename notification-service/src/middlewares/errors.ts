import { NextFunction, Request, Response } from 'express';
import { logger } from '../config/logging';
import { createErrorId, getRequestId, logError } from '@total-fretes/logging';

export async function ErrorHandlerMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> {
  if (res.headersSent) {
    return next(error);
  }

  const errorId = createErrorId();
  logError(logger, 'Erro não tratado', error, {
    path: req.originalUrl,
    method: req.method,
    requestId: getRequestId(res),
    errorId,
  });

  return res.status(500).json({
    message: 'Internal server error',
    requestId: getRequestId(res),
    errorId,
  });
}
