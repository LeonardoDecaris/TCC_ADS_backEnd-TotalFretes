import { CPF } from '@julioakira/cpf-cnpj-utils';

export function normalizeCpf(value: string): string {
	return CPF.Strip(value);
}

export function isValidCpf(value: string): boolean {
	return CPF.Validate(value);
}
