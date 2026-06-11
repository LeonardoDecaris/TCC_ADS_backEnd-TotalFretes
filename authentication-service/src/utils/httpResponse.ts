import { Response } from 'express';
import { buildErrorResponseFields } from './errorResponse';

type ErrorExtra = Record<string, unknown>;

export const sendError = (
  res: Response,
  status: number,
  message: string,
  ...rest: unknown[]
) => {
  let errorId: string | undefined;
  let mergedExtra: ErrorExtra = {};

  for (const item of rest) {
    if (item === undefined || item instanceof Error) continue;
    if (typeof item === 'string') {
      errorId = item;
      continue;
    }
    if (typeof item === 'object' && item !== null) {
      mergedExtra = { ...mergedExtra, ...(item as ErrorExtra) };
    }
  }

  const { requestId, errorId: resolvedErrorId } = buildErrorResponseFields(res, errorId);

  return res.status(status).json({
    status,
    message,
    requestId,
    errorId: resolvedErrorId,
    ...mergedExtra,
  });
};
