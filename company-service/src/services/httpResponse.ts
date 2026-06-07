import { Response } from 'express';
import { translation } from '../utils/i18n';
import { buildErrorResponseFields } from '../utils/errorResponse';

export type ValidationIssue = {
  field: string;
  message: string;
};

export type ConflictDetail = {
  field: string;
  message: string;
};

type BaseErrorBody = {
  status: number;
  code: string;
  message: string;
  requestId: string;
  errorId: string;
};

type PlainErrorBody = BaseErrorBody & { type: 'plain' };
type ValidationErrorBody = BaseErrorBody & { type: 'validation'; issues: ValidationIssue[] };
type ConflictErrorBody = BaseErrorBody & { type: 'conflict'; conflicts: ConflictDetail[] };

export type ErrorBody = PlainErrorBody | ValidationErrorBody | ConflictErrorBody;

export const sendError = async (
  res: Response,
  status: number,
  code: string,
  locale: string,
  errorId?: string | unknown,
) => {
  const resolvedErrorId = typeof errorId === 'string' ? errorId : undefined;
  const { requestId, errorId: generatedErrorId } = buildErrorResponseFields(res, resolvedErrorId);
  const body: PlainErrorBody = {
    type: 'plain',
    status,
    code,
    message: await translation(code, locale),
    requestId,
    errorId: generatedErrorId,
  };
  return res.status(status).json(body);
};

export const sendValidationError = async (
  res: Response,
  code: string,
  locale: string,
  issues: ValidationIssue[],
  errorId?: string | unknown,
) => {
  const resolvedErrorId = typeof errorId === 'string' ? errorId : undefined;
  const { requestId, errorId: generatedErrorId } = buildErrorResponseFields(res, resolvedErrorId);
  const body: ValidationErrorBody = {
    type: 'validation',
    status: 400,
    code,
    message: await translation(code, locale),
    issues,
    requestId,
    errorId: generatedErrorId,
  };
  return res.status(400).json(body);
};

export const sendConflictError = async (
  res: Response,
  code: string,
  locale: string,
  conflicts: ConflictDetail[],
  errorId?: string | unknown,
) => {
  const resolvedErrorId = typeof errorId === 'string' ? errorId : undefined;
  const { requestId, errorId: generatedErrorId } = buildErrorResponseFields(res, resolvedErrorId);
  const body: ConflictErrorBody = {
    type: 'conflict',
    status: 409,
    code,
    message: await translation(code, locale),
    conflicts,
    requestId,
    errorId: generatedErrorId,
  };
  return res.status(409).json(body);
};

export const sendSuccess = async (
  res: Response,
  status: number,
  code: string,
  locale: string,
  data: Record<string, unknown> = {},
) => {
  return res.status(status).json({
    message: await translation(code, locale),
    ...data,
  });
};
