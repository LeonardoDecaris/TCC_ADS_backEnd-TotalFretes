import { NextFunction, Request, Response } from 'express';
import { translation } from '../utils/i18n';
import { getLocaleFromRequest } from '../utils/locale';
import { verifyToken, type JwtRole } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: JwtRole;
        isInternal?: boolean;
      };
    }
  }
}

type AllowedRole = JwtRole;

async function authMessage(req: Request, key: string): Promise<string> {
  const locale = getLocaleFromRequest(req);
  return translation(key, locale);
}

function isInternalRequest(req: Request): boolean {
  const configuredToken = process.env.INTERNAL_SERVICE_TOKEN?.trim();
  const requestToken = req.headers['x-internal-service-token'];
  if (!configuredToken || typeof requestToken !== 'string') return false;
  return requestToken.trim() === configuredToken;
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  if (isInternalRequest(req)) {
    req.user = { id: 0, role: 'ADMIN', isInternal: true };
    return next();
  }

  const authHeader = req.headers.authorization?.trim();
  if (!authHeader) {
    return res.status(401).json({ message: await authMessage(req, 'AUTH.TOKEN_NOT_PROVIDED') });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: await authMessage(req, 'AUTH.TOKEN_NOT_FORMATTED') });
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded.id || !decoded.role) {
      return res.status(403).json({ message: await authMessage(req, 'AUTH.ROLE_DENIED') });
    }

    req.user = {
      id: Number(decoded.id),
      role: decoded.role,
      isInternal: false,
    };
    return next();
  } catch {
    return res.status(401).json({ message: await authMessage(req, 'AUTH.TOKEN_INVALID') });
  }
}

export const authorizeRoles = (...allowedRoles: AllowedRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: await authMessage(req, 'AUTH.NOT_AUTHENTICATED') });
    }

    if (req.user.role === 'ADMIN') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: await authMessage(req, 'AUTH.PERMISSION_INSUFFICIENT'),
      });
    }

    return next();
  };
};
