import { Response } from 'express';

type ErrorExtra = Record<string, unknown>;

export const sendError = (
  res: Response,
  status: number,
  message: string,
  extra: ErrorExtra = {},
) => {
  return res.status(status).json({
    status,
    message,
    ...extra,
  });
};
