import { ZodError } from 'zod';
import { originFields } from '@total-fretes/observability';
import { translation } from './i18n';

export const handleZodError = async (error: unknown, locale: string) => {
  if (error instanceof ZodError) {
    return {
      status: 400,
      body: {
        status: 400,
        message: await translation('VALIDATION.GENERAL_ERROR', locale),
        errors: error.issues.map((err) => err.path[0]),
        ...originFields(error),
      },
    };
  }
  return null;
};
