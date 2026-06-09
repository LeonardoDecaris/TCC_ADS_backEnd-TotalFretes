import jwt from 'jsonwebtoken';

export type TestJwtRole = 'USER' | 'COMPANY' | 'ADMIN';

export type CreateTestTokenOptions = {
  id?: number;
  role?: TestJwtRole;
  secret?: string;
  expiresIn?: string | number;
};

export function createTestToken(options: CreateTestTokenOptions = {}): string {
  const secret = options.secret ?? process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET não configurado para createTestToken');
  }

  const payload = {
    id: options.id ?? 1,
    role: options.role ?? 'ADMIN',
  };

  return jwt.sign(payload, secret, {
    expiresIn: options.expiresIn ?? '1h',
  } as jwt.SignOptions);
}

export function decodeTestToken(token: string, secret?: string): jwt.JwtPayload {
  const jwtSecret = secret ?? process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET não configurado para decodeTestToken');
  }
  return jwt.verify(token, jwtSecret) as jwt.JwtPayload;
}
