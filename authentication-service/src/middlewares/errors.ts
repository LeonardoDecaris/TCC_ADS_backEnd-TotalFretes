import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logging';
import { createErrorId, getRequestId, logError } from '@total-fretes/logging';
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

  if (error instanceof ZodError) {
    const zodError = await handleZodError(error, locale, res);
    if (zodError) {
      return res.status(zodError.status).json(zodError.body);
    }
  }

  const errorId = createErrorId();
  const logMessage =
    process.env.NODE_ENV !== 'production' ? 'Error occurred' : 'Erro desconhecido';
  logError(logger, logMessage, error, {
    path: req.originalUrl,
    method: req.method,
    requestId: getRequestId(res),
    errorId,
  });

  const message = await translation('AUTH.INTERNAL_ERROR', locale);
  return sendError(res, 500, message, errorId);
}
