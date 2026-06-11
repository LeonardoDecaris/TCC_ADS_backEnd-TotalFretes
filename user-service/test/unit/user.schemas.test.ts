import { createUserSchema, updateUserSchema } from '../../src/schemas/user.schemas';

const validUser = {
  name: 'João Silva',
  email: 'motorista@test.com',
  birthDate: '1990-05-10',
  phoneNumber: '11999998888',
  cpf: '52998224725',
  sex: 'M',
  useGlasses: 'true',
  isDeficient: '0',
  cnhNumber: '12345678900',
  cnhType_id: 1,
};

describe('createUserSchema', () => {
  it('converte useGlasses e isDeficient de string para boolean', () => {
    const result = createUserSchema.safeParse(validUser);
    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.useGlasses).toBe(true);
    expect(result.data.isDeficient).toBe(false);
  });

  it('aceita boolean nativo', () => {
    const result = createUserSchema.safeParse({
      ...validUser,
      useGlasses: false,
      isDeficient: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.useGlasses).toBe(false);
      expect(result.data.isDeficient).toBe(true);
    }
  });

  it('rejeita email inválido', () => {
    const result = createUserSchema.safeParse({ ...validUser, email: 'invalido' });
    expect(result.success).toBe(false);
  });

  it('rejeita CPF inválido', () => {
    const result = createUserSchema.safeParse({ ...validUser, cpf: '12345678901' });
    expect(result.success).toBe(false);
  });

  it('normaliza CPF formatado para dígitos', () => {
    const result = createUserSchema.safeParse({ ...validUser, cpf: '529.982.247-25' });
    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.cpf).toBe('52998224725');
  });
});

describe('updateUserSchema', () => {
  it('não permite atualizar CPF', () => {
    const result = updateUserSchema.safeParse({ cpf: '12345678901' });
    expect(result.success).toBe(false);
  });
});
