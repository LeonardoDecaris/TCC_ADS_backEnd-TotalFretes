import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logError } from '@total-fretes/observability';
import { logger } from '../config/logger';
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

  logError(logger, 'Erro não tratado', error, { path: req.originalUrl, method: req.method });
  return sendError(res, 500, 'COMMON.INTERNAL_ERROR', locale, error);
}
