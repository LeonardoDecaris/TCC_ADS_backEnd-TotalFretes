import axios from 'axios';

const I18N_SERVICE_URL = process.env.I18N_SERVICE_URL;

/** Monta mapa `DOMÍNIO.CHAVE` → texto a partir de objetos aninhados e chaves literais com `.` */
function collectStringLeaves(
	obj: Record<string, unknown>,
	prefix = '',
	out: Record<string, string> = {},
): Record<string, string> {
	for (const [k, v] of Object.entries(obj)) {
		const path = prefix ? `${prefix}.${k}` : k;
		if (typeof v === 'string') {
			out[path] = v;
		} else if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
			collectStringLeaves(v as Record<string, unknown>, path, out);
		}
	}
	return out;
}

export const translation = async (code: string, locale = 'pt-BR'): Promise<string> => {
	try {
		if (!I18N_SERVICE_URL) return code;

		const url = `${I18N_SERVICE_URL}/i18n/${locale}/freight-service.json`;
		const { data } = await axios.get<Record<string, unknown>>(url, { timeout: 2000 });
		const obj = data ?? {};

		const direct = obj[code];
		if (typeof direct === 'string') return direct;

		const flat = collectStringLeaves(obj);
		const resolved = flat[code];
		if (typeof resolved === 'string') return resolved;

		return code;
	} catch {
		return code;
	}
};
