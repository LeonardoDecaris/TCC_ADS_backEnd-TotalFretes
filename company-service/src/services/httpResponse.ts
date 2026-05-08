import { Response } from 'express';
import { translation } from '../utils/i18n';

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
};

type PlainErrorBody      = BaseErrorBody & { type: 'plain' };
type ValidationErrorBody = BaseErrorBody & { type: 'validation'; issues: ValidationIssue[] };
type ConflictErrorBody   = BaseErrorBody & { type: 'conflict';   conflicts: ConflictDetail[] };

export type ErrorBody = PlainErrorBody | ValidationErrorBody | ConflictErrorBody;

export const sendError = async (
  res: Response,
  status: number,
  code: string,
  locale: string,
) => {
  const body: PlainErrorBody = { type: 'plain', status, code, message: await translation(code, locale) };
  return res.status(status).json(body);
};

export const sendValidationError = async (
  res: Response,
  code: string,
  locale: string,
  issues: ValidationIssue[],
) => {
  const body: ValidationErrorBody = { type: 'validation', status: 400, code, message: await translation(code, locale), issues };
  return res.status(400).json(body);
};

export const sendConflictError = async (
  res: Response,
  code: string,
  locale: string,
  conflicts: ConflictDetail[],
) => {
  const body: ConflictErrorBody = { type: 'conflict', status: 409, code, message: await translation(code, locale), conflicts };
  return res.status(409).json(body);
};