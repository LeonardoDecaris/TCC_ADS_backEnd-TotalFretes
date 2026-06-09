import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';

export const REQUEST_ID_HEADER = 'x-request-id';

type RequestContext = {
  requestId: string;
};

export const requestContext = new AsyncLocalStorage<RequestContext>();

export function createErrorId(): string {
  return randomUUID();
}

export function resolveRequestId(req: Request): string {
  const header = req.headers[REQUEST_ID_HEADER];
  if (typeof header === 'string' && header.trim()) return header.trim();
  if (Array.isArray(header) && header[0]?.trim()) return header[0].trim();
  return randomUUID();
}

export function getRequestId(res: Response): string {
  return res.locals.requestId ?? getActiveRequestId() ?? 'unknown';
}

export function getActiveRequestId(): string | undefined {
  return requestContext.getStore()?.requestId;
}
