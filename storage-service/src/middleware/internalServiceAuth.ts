import type { NextFunction, Request, Response } from 'express';

/** Protege GET de imagem por id para chamadas internas (ex.: user-service). */
export function internalServiceAuth(req: Request, res: Response, next: NextFunction): void {
  const expected = process.env.INTERNAL_SERVICE_TOKEN;
  if (!expected) {
    res.status(503).json({ message: 'INTERNAL_SERVICE_TOKEN is not configured' });
    return;
  }
  if (req.header('x-internal-token') !== expected) {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }
  next();
}
