import { createCompanySchema } from '../../src/schemas/company.schemas';

const validCompany = {
  name: 'Transportes Demo Ltda',
  email: 'empresa@demo.totalfretes.com.br',
  birthFundation: '2015-06-20',
  phoneNumber: '+55 (11) 98888-7777',
  cnpj: '00.000.000/0001-91',
  website: '',
};

describe('createCompanySchema', () => {
  it('aceita payload válido e normaliza telefone e website', () => {
    const result = createCompanySchema.safeParse(validCompany);
    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.phoneNumber).toBe('5511988887777');
    expect(result.data.website).toBeNull();
    expect(result.data.cnpj).toBe('00000000000191');
  });

  it('rejeita CNPJ inválido', () => {
    const result = createCompanySchema.safeParse({ ...validCompany, cnpj: '11.111.111/1111-11' });
    expect(result.success).toBe(false);
  });

  it('rejeita email inválido', () => {
    const result = createCompanySchema.safeParse({ ...validCompany, email: 'nao-email' });
    expect(result.success).toBe(false);
  });
});
