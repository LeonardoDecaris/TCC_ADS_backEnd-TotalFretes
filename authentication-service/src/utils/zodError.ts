import { ZodError } from 'zod';
import { Response } from 'express';
import { translation } from './i18n';
import { buildErrorResponseFields } from './errorResponse';

export const handleZodError = async (error: unknown, locale: string, res: Response) => {
  if (error instanceof ZodError) {
    const { requestId, errorId } = buildErrorResponseFields(res);
    return {
      status: 400,
      body: {
        status: 400,
        message: await translation('VALIDATION.GENERAL_ERROR', locale),
        errors: error.issues.map((err) => err.path[0]),
        requestId,
        errorId,
      },
    };
  }
  return null;
};
