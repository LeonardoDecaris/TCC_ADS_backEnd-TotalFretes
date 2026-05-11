/**
 * CNPJ alfanumérico — IN RFB nº 2.229/2024 (dígitos verificadores: módulo 11, valores ASCII − 48).
 * Compatível com CNPJ numérico legado.
 */

const WEIGHTS_DV1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const;
const WEIGHTS_DV2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const;

function asciiMinus48(c: string): number {
	return c.charCodeAt(0) - 48;
}

export function normalizeCnpj(value: string): string {
	const upper = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
	let out = "";
	for (let i = 0; i < upper.length && out.length < 14; i++) {
		const c = upper[i]!;
		if (out.length < 12) {
			if (/[A-Z0-9]/.test(c)) out += c;
		} else if (/\d/.test(c)) {
			out += c;
		}
	}
	return out;
}

export function isValidCnpjInRfb2229(value: string): boolean {
	const normalized = normalizeCnpj(value);
	if (normalized.length !== 14) return false;
	if (!/^[A-Z0-9]{12}\d{2}$/.test(normalized)) return false;

	const base = normalized.slice(0, 12);
	const dv = normalized.slice(12, 14);

	let sum = 0;
	for (let i = 0; i < 12; i++) {
		sum += asciiMinus48(base[i]!) * WEIGHTS_DV1[i]!;
	}
	let rest = sum % 11;
	const d1 = rest < 2 ? 0 : 11 - rest;

	sum = 0;
	for (let i = 0; i < 12; i++) {
		sum += asciiMinus48(base[i]!) * WEIGHTS_DV2[i]!;
	}
	sum += d1 * WEIGHTS_DV2[12]!;
	rest = sum % 11;
	const d2 = rest < 2 ? 0 : 11 - rest;

	return dv === `${d1}${d2}`;
}
