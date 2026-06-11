import { accountSchema } from '../../src/schemas/account.schemas';

describe('accountSchema', () => {
  it('aceita payload válido de criação de conta', () => {
    const result = accountSchema.safeParse({
      email: 'nova@totalfretes.com.br',
      password: 'Senha@123',
      subject_id: 10,
      account_type_id: 2,
    });
    expect(result.success).toBe(true);
  });

  it('rejeita senha com menos de 8 caracteres', () => {
    const result = accountSchema.safeParse({
      email: 'nova@totalfretes.com.br',
      password: 'curta',
      subject_id: 10,
      account_type_id: 2,
    });
    expect(result.success).toBe(false);
  });

  it('rejeita subject_id não positivo', () => {
    const result = accountSchema.safeParse({
      email: 'nova@totalfretes.com.br',
      password: 'Senha@123',
      subject_id: 0,
      account_type_id: 2,
    });
    expect(result.success).toBe(false);
  });
});
