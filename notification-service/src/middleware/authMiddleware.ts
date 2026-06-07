import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: 'USER' | 'COMPANY' | 'ADMIN';
      };
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization?.trim();
  if (!authHeader) {
    return res.status(401).json({ message: 'Token not provided' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token not formatted' });
  }

  try {
    const decoded = verifyToken(token);

    if (!decoded.id || !decoded.role) {
      return res.status(403).json({ message: 'role denied. User not authenticated.' });
    }

    req.user = {
      id: Number(decoded.id),
      role: decoded.role as 'USER' | 'COMPANY' | 'ADMIN',
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Token inválido',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const allowOwnerOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const paramUserId = Number(req.params.userId);
  if (req.user.role === 'ADMIN' || req.user.id === paramUserId) {
    return next();
  }

  return res.status(403).json({ message: 'role denied to the requested resource.' });
};
