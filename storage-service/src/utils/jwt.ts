import jwt, { JwtPayload } from 'jsonwebtoken';

export type JwtRole = 'USER' | 'COMPANY' | 'ADMIN';

export type JwtClaims = JwtPayload & {
  id?: number | string;
  role?: JwtRole;
};

export function verifyToken(token: string): JwtClaims {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.verify(token, secret) as JwtClaims;
}
