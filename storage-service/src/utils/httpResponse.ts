import { Response } from 'express';
import { originFields } from '@total-fretes/observability';

export const sendStorageError = async (
  res: Response,
  status: number,
  message: string,
  error?: unknown,
) => {
  return res.status(status).json({
    message,
    ...originFields(error),
  });
};
