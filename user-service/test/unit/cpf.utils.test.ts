import { isValidCpf, normalizeCpf } from '../../src/utils/cpf';

describe('cpf utils', () => {
  it('normalizeCpf remove máscara e mantém 11 dígitos', () => {
    expect(normalizeCpf('529.982.247-25')).toBe('52998224725');
  });

  it('isValidCpf aceita CPF válido com e sem máscara', () => {
    expect(isValidCpf('52998224725')).toBe(true);
    expect(isValidCpf('529.982.247-25')).toBe(true);
  });

  it('isValidCpf rejeita dígitos verificadores incorretos', () => {
    expect(isValidCpf('12345678901')).toBe(false);
  });

  it('isValidCpf rejeita tamanho inválido', () => {
    expect(isValidCpf('123')).toBe(false);
  });
});
