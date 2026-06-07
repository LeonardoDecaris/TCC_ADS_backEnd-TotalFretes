import { isValidCnpjInRfb2229, normalizeCnpj } from '../../src/utils/cnpjInRfb2229';

describe('cnpjInRfb2229', () => {
  it('normalizeCnpj remove máscara e mantém 14 caracteres', () => {
    expect(normalizeCnpj('00.000.000/0001-91')).toBe('00000000000191');
  });

  it('isValidCnpjInRfb2229 aceita CNPJ seed válido', () => {
    expect(isValidCnpjInRfb2229('00000000000191')).toBe(true);
    expect(isValidCnpjInRfb2229('00.000.000/0001-91')).toBe(true);
  });

  it('isValidCnpjInRfb2229 rejeita dígitos verificadores incorretos', () => {
    expect(isValidCnpjInRfb2229('00000000000100')).toBe(false);
  });

  it('isValidCnpjInRfb2229 rejeita tamanho inválido', () => {
    expect(isValidCnpjInRfb2229('123')).toBe(false);
  });
});
