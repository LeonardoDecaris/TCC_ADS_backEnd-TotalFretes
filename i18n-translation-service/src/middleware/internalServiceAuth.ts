import type { NextFunction, Request, Response } from 'express';

export function internalServiceAuth(req: Request, res: Response, next: NextFunction): void {
  const expected = process.env.INTERNAL_SERVICE_TOKEN;
  if (!expected) {
    res.status(503).json({ error: { code: 'NOT_CONFIGURED', message: 'INTERNAL_SERVICE_TOKEN missing' } });
    return;
  }
  if (req.header('x-internal-token') !== expected) {
    res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Forbidden' } });
    return;
  }
  next();
}
