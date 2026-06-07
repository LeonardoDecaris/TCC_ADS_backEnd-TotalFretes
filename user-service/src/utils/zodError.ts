import { ZodError } from 'zod';
import { translation } from './i18n';
import { createErrorId } from './correlation';
import { sendValidationError, type ValidationIssue } from '../services/httpResponse';
import { Response } from 'express';

export const handleZodError = async (
  error: unknown,
  locale: string,
  res: Response,
  sourceError?: unknown,
): Promise<boolean> => {
  if (!(error instanceof ZodError)) return false;

  const errorId = createErrorId();
  const issues: ValidationIssue[] = await Promise.all(
    error.issues.map(async (issue) => ({
      field: issue.path.join('.') || 'unknown',
      message: await translation(issue.message, locale),
    })),
  );

  await sendValidationError(res, 'VALIDATION.GENERAL_ERROR', locale, issues, errorId);
  return true;
};
