function computeCpfDigits(base9: string): string {
	let sum = 0;
	for (let i = 0; i < 9; i += 1) {
		sum += Number(base9[i]) * (10 - i);
	}
	let rest = (sum * 10) % 11;
	const d1 = rest === 10 ? 0 : rest;

	sum = 0;
	for (let i = 0; i < 9; i += 1) {
		sum += Number(base9[i]) * (11 - i);
	}
	sum += d1 * 2;
	rest = (sum * 10) % 11;
	const d2 = rest === 10 ? 0 : rest;

	return `${d1}${d2}`;
}

/** Gera CPF numérico válido a partir de um índice sequencial. */
export function generateCpf(seedIndex: number): string {
	const base9 = String(100000000 + seedIndex).slice(-9);
	return `${base9}${computeCpfDigits(base9)}`;
}
