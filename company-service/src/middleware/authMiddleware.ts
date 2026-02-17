import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: 'usuario' | 'empresa' | 'admin';
      };
    }
  }
}

/*
 * @description: Middleware de autenticação
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization?.trim();
  if (!authHeader) {
    return res.status(401).json({ message: "Token not provided" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token not formatted" });
  }

  try {
    const decoded = verifyToken(token) as {
      id?: number;
      role?: 'usuario' | 'empresa' | 'admin';
      [key: string]: any;
    };

    if (!decoded.id || !decoded.role) {
      return res.status(403).json({ message: "role denied. User not authenticated." });
    }

    req.user = {
      id: Number(decoded.id),
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

type Role = 'usuario' | 'empresa' | 'admin';

/*
 * @description: Permite que o usuário seja admin ou tenha um dos roles permitidos
 */
export const authorizeRoles = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { role } = req.user;

    if (role === 'admin') {
      return next();
    }

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: "role denied. Permission insufficient." });
    }

    next();
  };
};

/*
 * @description: Permite que o usuário proprietário ou tenha um dos roles permitidos
 */
export const allowOwnerOrRoles = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { id, role } = req.user;
    const paramId = Number(req.params.id);

    if (allowedRoles.includes(role) || role === 'admin') {
      return next();
    }

    if (role === 'usuario' && id === paramId) {
      return next();
    }

    return res.status(403).json({ message: "role denied to the requested resource." });
  };
};