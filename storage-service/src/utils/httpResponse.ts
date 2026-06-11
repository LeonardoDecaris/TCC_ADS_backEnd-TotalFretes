import { Response } from 'express';
import { buildErrorResponseFields } from './errorResponse';

export const sendStorageError = async (
  res: Response,
  status: number,
  message: string,
  errorId?: string | unknown,
) => {
  const resolvedErrorId = typeof errorId === 'string' ? errorId : undefined;
  const { requestId, errorId: generatedErrorId } = buildErrorResponseFields(res, resolvedErrorId);
  return res.status(status).json({
    message,
    requestId,
    errorId: generatedErrorId,
  });
};
