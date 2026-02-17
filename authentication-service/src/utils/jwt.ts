import dotenv from 'dotenv';
import jwt from "jsonwebtoken";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "1d";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET não foi configurado");
}

export type JwtRole = 'usuario' | 'empresa' | 'admin';

export const generateToken = (user: { id: string; role: JwtRole }): string => {
  const payload = { id: user.id, role: user.role };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string) : any => {
  return jwt.verify(token, JWT_SECRET);
};