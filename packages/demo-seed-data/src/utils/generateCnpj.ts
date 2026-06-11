const WEIGHTS_DV1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const;
const WEIGHTS_DV2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const;

function asciiMinus48(c: string): number {
	return c.charCodeAt(0) - 48;
}

function computeCheckDigits(base12: string): string {
	let sum = 0;
	for (let i = 0; i < 12; i += 1) {
		sum += asciiMinus48(base12[i]!) * WEIGHTS_DV1[i]!;
	}
	let rest = sum % 11;
	const d1 = rest < 2 ? 0 : 11 - rest;

	sum = 0;
	for (let i = 0; i < 12; i += 1) {
		sum += asciiMinus48(base12[i]!) * WEIGHTS_DV2[i]!;
	}
	sum += d1 * WEIGHTS_DV2[12]!;
	rest = sum % 11;
	const d2 = rest < 2 ? 0 : 11 - rest;

	return `${d1}${d2}`;
}

/** Gera CNPJ numérico válido (IN RFB 2229) a partir de um índice sequencial. */
export function generateCnpj(seedIndex: number): string {
	const branch = String(seedIndex).padStart(4, '0').slice(-4);
	const base12 = `00000000${branch}`.slice(-12);
	return `${base12}${computeCheckDigits(base12)}`;
}
