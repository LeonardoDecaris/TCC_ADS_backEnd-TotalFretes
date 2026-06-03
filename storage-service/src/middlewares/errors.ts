import { NextFunction, Request, Response } from 'express';
import { logError } from '@total-fretes/observability';
import { logger } from '../config/logger';
import { translation } from '../utils/i18n';
import { getLocaleFromRequest } from '../utils/locale';
import { sendStorageError } from '../utils/httpResponse';

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
  logError(logger, 'Erro não tratado', error, { path: req.originalUrl, method: req.method });
  const message = await translation('USER_IMAGE.UPLOAD_PROCESS_FAILED', locale);
  return sendStorageError(res, 500, message, error);
}
