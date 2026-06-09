import {
  accountListQuerySchema,
  accountPatchSchema,
  accountAdminCreateSchema,
  subjectIdParamSchema,
} from '../../src/schemas/accountAdmin.schemas';

describe('accountListQuerySchema', () => {
  it('aplica defaults de paginação', () => {
    const result = accountListQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
  });

  it('rejeita limit acima de 100', () => {
    expect(() => accountListQuerySchema.parse({ limit: 101 })).toThrow();
  });
});

describe('accountPatchSchema', () => {
  it('rejeita patch vazio', () => {
    const result = accountPatchSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('aceita atualização de email', () => {
    const result = accountPatchSchema.safeParse({ email: 'novo@totalfretes.com.br' });
    expect(result.success).toBe(true);
  });
});

describe('accountAdminCreateSchema', () => {
  it('exige senha com mínimo de 8 caracteres', () => {
    const result = accountAdminCreateSchema.safeParse({
      email: 'admin@totalfretes.com.br',
      password: 'curta',
    });
    expect(result.success).toBe(false);
  });
});

describe('subjectIdParamSchema', () => {
  it('aceita subjectId positivo via coerce', () => {
    const result = subjectIdParamSchema.safeParse({ subjectId: '42' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.subjectId).toBe(42);
  });

  it('rejeita subjectId zero ou negativo', () => {
    expect(subjectIdParamSchema.safeParse({ subjectId: '0' }).success).toBe(false);
    expect(subjectIdParamSchema.safeParse({ subjectId: '-3' }).success).toBe(false);
  });
});
