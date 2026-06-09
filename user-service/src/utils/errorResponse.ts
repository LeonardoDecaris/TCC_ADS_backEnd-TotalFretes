import { Response } from 'express';
import { createErrorId, getRequestId } from '@total-fretes/logging';

export type ErrorResponseFields = {
  requestId: string;
  errorId: string;
};

export function buildErrorResponseFields(res: Response, errorId?: string): ErrorResponseFields {
  return {
    requestId: getRequestId(res),
    errorId: errorId ?? createErrorId(),
  };
}
