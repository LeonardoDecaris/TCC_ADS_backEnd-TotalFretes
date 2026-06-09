import { loginSchema } from '../../src/schemas/login.schemas';

describe('loginSchema', () => {
  it('aceita email e senha válidos', () => {
    const result = loginSchema.safeParse({
      email: 'admin@totalfretes.com.br',
      password: 'Admin@123456',
    });
    expect(result.success).toBe(true);
  });

  it('rejeita email inválido', () => {
    const result = loginSchema.safeParse({
      email: 'invalido',
      password: 'Admin@123456',
    });
    expect(result.success).toBe(false);
  });

  it('rejeita senha vazia', () => {
    const result = loginSchema.safeParse({
      email: 'admin@totalfretes.com.br',
      password: '',
    });
    expect(result.success).toBe(false);
  });
});
