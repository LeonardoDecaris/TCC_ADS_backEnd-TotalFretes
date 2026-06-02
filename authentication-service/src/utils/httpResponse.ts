import { Response } from 'express';
import { originFields } from '@total-fretes/observability';

type ErrorExtra = Record<string, unknown>;

export const sendError = (
  res: Response,
  status: number,
  message: string,
  errorOrExtra?: unknown,
  extra: ErrorExtra = {},
) => {
  const isErrorInstance = errorOrExtra instanceof Error;
  const origin = isErrorInstance ? originFields(errorOrExtra) : {};
  const mergedExtra =
    errorOrExtra !== undefined && !isErrorInstance
      ? (errorOrExtra as ErrorExtra)
      : extra;

  return res.status(status).json({
    status,
    message,
    ...origin,
    ...mergedExtra,
  });
};
