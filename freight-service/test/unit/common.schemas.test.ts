import { idParamSchema } from '../../src/schemas/common.schemas';

describe('idParamSchema', () => {
  it('aceita id positivo via coerce', () => {
    const result = idParamSchema.safeParse({ id: '42' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.id).toBe(42);
  });

  it('rejeita id zero', () => {
    expect(idParamSchema.safeParse({ id: '0' }).success).toBe(false);
  });

  it('rejeita id negativo', () => {
    expect(idParamSchema.safeParse({ id: '-1' }).success).toBe(false);
  });
});
