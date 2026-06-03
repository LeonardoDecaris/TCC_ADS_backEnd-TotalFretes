import { NextFunction, Request, Response } from 'express';
import { originFields } from '@total-fretes/observability';
import { verifyToken, type JwtRole } from '../utils/jwt';
import { translation } from '../utils/i18n';
import { getLocaleFromRequest } from '../utils/locale';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: JwtRole;
      };
    }
  }
}

async function authMessage(req: Request, key: string): Promise<string> {
  const locale = getLocaleFromRequest(req);
  return translation(key, locale);
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization?.trim();
  if (!authHeader) {
    return res.status(401).json({
      message: await authMessage(req, 'AUTH.TOKEN_NOT_PROVIDED'),
    });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      message: await authMessage(req, 'AUTH.TOKEN_NOT_FORMATTED'),
    });
  }

  try {
    const decoded = verifyToken(token) as {
      id?: number;
      role?: JwtRole;
      [key: string]: unknown;
    };

    if (!decoded.id || !decoded.role) {
      return res.status(403).json({
        message: await authMessage(req, 'AUTH.ROLE_DENIED'),
      });
    }

    req.user = {
      id: Number(decoded.id),
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: await authMessage(req, 'AUTH.TOKEN_INVALID'),
      ...originFields(error),
    });
  }
};

type Role = JwtRole;

export const authorizeRoles = (...allowedRoles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        message: await authMessage(req, 'AUTH.NOT_AUTHENTICATED'),
      });
    }

    const { role } = req.user;

    if (role === 'ADMIN') {
      return next();
    }

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        message: await authMessage(req, 'AUTH.PERMISSION_INSUFFICIENT'),
      });
    }

    next();
  };
};

export const allowOwnerOrRoles = (...allowedRoles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        message: await authMessage(req, 'AUTH.NOT_AUTHENTICATED'),
      });
    }

    const { id, role } = req.user;
    const paramId = Number(req.params.id);
    const userId = Number(id);

    if (allowedRoles.includes(role) || role === 'ADMIN') {
      return next();
    }

    if (!Number.isNaN(userId) && !Number.isNaN(paramId) && userId === paramId) {
      return next();
    }

    return res.status(403).json({
      message: await authMessage(req, 'AUTH.RESOURCE_ACCESS_DENIED'),
    });
  };
};
