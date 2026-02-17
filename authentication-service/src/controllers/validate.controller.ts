import { Request, Response } from "express";
import { verifyToken } from "../utils/jwt";

type Role = "usuario" | "empresa" | "admin";

/**
 * Endpoint para outros microserviços validarem o token.
 * Contrato: Authorization: Bearer <token> ou body { token: string }
 * Resposta 200: { valid: true, user: { id: number, role: Role } }
 * Resposta 401: { valid: false, message: string }
 */
export const validateToken = async (req: Request, res: Response) => {
  let token: string | undefined;

  const authHeader = req.headers.authorization?.trim();
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7).trim();
  }
  if (!token && typeof req.body?.token === "string") {
    token = req.body.token.trim();
  }

  if (!token) {
    return res.status(401).json({
      valid: false,
      message: "Token não fornecido. Use header Authorization: Bearer <token> ou body { token }.",
    });
  }

  try {
    const decoded = verifyToken(token) as {
      id?: string | number;
      role?: Role;
      [key: string]: unknown;
    };

    if (!decoded.id || !decoded.role) {
      return res.status(401).json({
        valid: false,
        message: "Token invalid: payload without id or role.",
      });
    }

    const role = decoded.role as Role;
    if (!["usuario", "empresa", "admin"].includes(role)) {
      return res.status(401).json({
        valid: false,
        message: "Token invalid: invalid role.",
      });
    }

    return res.status(200).json({
      valid: true,
      user: {
        id: Number(decoded.id),
        role,
      },
    });
  } catch {
    return res.status(401).json({
      valid: false,
      message: "Token invalid or expired.",
    });
  }
};
