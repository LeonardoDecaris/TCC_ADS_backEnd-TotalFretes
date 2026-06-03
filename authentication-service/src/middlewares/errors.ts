import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logError } from '@total-fretes/observability';
import { logger } from '../config/logger';
import { sendError } from '../utils/httpResponse';
import { getLocaleFromRequest } from '../utils/locale';
import { handleZodError } from '../utils/zodError';
import { translation } from '../utils/i18n';

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

  const zodError = await handleZodError(error, locale);
  if (zodError) {
    return res.status(zodError.status).json(zodError.body);
  }

  if (process.env.NODE_ENV !== 'production') {
    logError(logger, 'Error occurred', error, { path: req.originalUrl });
  } else {
    logError(logger, 'Erro desconhecido', error, { path: req.originalUrl });
  }

  const message = await translation('AUTH.INTERNAL_ERROR', locale);
  return sendError(res, 500, message, error);
}
