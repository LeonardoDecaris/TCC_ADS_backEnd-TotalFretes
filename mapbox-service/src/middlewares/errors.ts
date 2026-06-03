import { NextFunction, Request, Response } from 'express';
import { handleControllerError } from '../utils/mapBoxError';

export function ErrorHandlerMiddleware(
  error: Error,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    return next(error);
  }
  handleControllerError(error, res);
}
