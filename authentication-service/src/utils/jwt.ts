import dotenv from 'dotenv';
import jwt from "jsonwebtoken";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "1d";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET não foi configurado");
}

export type JwtRole = 'USER' | 'COMPANY' | 'ADMIN';

export const generateToken = (user: { id: string; role: JwtRole }): string => {
  const payload = { id: user.id, role: user.role };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, JWT_SECRET);
};

const RESET_EXPIRES_IN = '15m';

export const generateResetToken = (payload: { email: string }): string => {
  return jwt.sign(
    { ...payload, purpose: 'password_reset' },
    JWT_SECRET,
    { expiresIn: RESET_EXPIRES_IN }
  );
};

export const verifyResetToken = (token: string): { email: string } => {
  const decoded = jwt.verify(token, JWT_SECRET) as { email?: string; purpose?: string };
  if (decoded?.purpose !== 'password_reset' || !decoded?.email) {
    throw new Error('Invalid reset token');
  }
  return { email: decoded.email };
};