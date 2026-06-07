import { generateToken, verifyToken, generateResetToken, verifyResetToken } from '../../src/utils/jwt';

describe('JWT utils', () => {
  it('gera e valida token de autenticação', () => {
    const token = generateToken({ id: 42, role: 'ADMIN' });
    const decoded = verifyToken(token) as { id: number; role: string };
    expect(decoded.id).toBe(42);
    expect(decoded.role).toBe('ADMIN');
  });

  it('gera e valida token de reset de senha', () => {
    const token = generateResetToken({ email: 'user@test.com' });
    const decoded = verifyResetToken(token);
    expect(decoded.email).toBe('user@test.com');
  });

  it('rejeita token de reset inválido', () => {
    const token = generateToken({ id: 1, role: 'USER' });
    expect(() => verifyResetToken(token)).toThrow('Invalid reset token');
  });
});
