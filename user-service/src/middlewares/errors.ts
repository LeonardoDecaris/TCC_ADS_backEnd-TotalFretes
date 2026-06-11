import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logging';
import { createErrorId, getRequestId, logError } from '@total-fretes/logging';
import { sendError } from '../services/httpResponse';
import { getLocaleFromRequest } from '../utils/locale';
import { handleZodError } from '../utils/zodError';

export async function ErrorHandlerMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> {
  if (res.headersSent) {
    return next(error);
  }

  const locale = getLocaleFromRequest(req);

  if (error instanceof ZodError) {
    if (await handleZodError(error, locale, res, error)) return;
  }

  const errorId = createErrorId();
  logError(logger, 'Erro não tratado', error, {
    path: req.originalUrl,
    method: req.method,
    requestId: getRequestId(res),
    errorId,
  });

  return sendError(res, 500, 'COMMON.INTERNAL_ERROR', locale, errorId);
}
