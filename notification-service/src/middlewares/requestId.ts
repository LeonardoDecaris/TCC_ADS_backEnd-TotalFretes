import { NextFunction, Request, Response } from 'express';
import { REQUEST_ID_HEADER, requestContext, resolveRequestId } from '../utils/correlation';

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId = resolveRequestId(req);
  res.locals.requestId = requestId;
  res.setHeader(REQUEST_ID_HEADER, requestId);
  requestContext.run({ requestId }, () => next());
}
