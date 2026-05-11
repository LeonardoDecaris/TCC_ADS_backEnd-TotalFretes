import { getI18nHttp } from '../services/service';

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
	if (!process.env.I18N_SERVICE_URL) return code;

	const data = (await getI18nHttp({ locale: locale || 'pt-BR' })) as Record<string, unknown>;

	const direct = data[code];
	if (typeof direct === 'string') return direct;

	const flat = collectStringLeaves(data);
	const resolved = flat[code];
	if (typeof resolved === 'string') return resolved;

	return code;
};