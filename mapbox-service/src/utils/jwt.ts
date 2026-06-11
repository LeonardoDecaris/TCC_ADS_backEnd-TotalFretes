import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET não foi configurado');
}

export type AuthRole = 'USER' | 'COMPANY' | 'ADMIN';

export type AuthPayload = jwt.JwtPayload & {
  id?: number;
  role?: AuthRole;
};

export const verifyToken = (token: string): AuthPayload => {
  return jwt.verify(token, JWT_SECRET) as AuthPayload;
};
