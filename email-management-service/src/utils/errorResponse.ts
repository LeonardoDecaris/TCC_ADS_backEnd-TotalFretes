import { Response } from 'express';
import { createErrorId, getRequestId } from './correlation';

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
