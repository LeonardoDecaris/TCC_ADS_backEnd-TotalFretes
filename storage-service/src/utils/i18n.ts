import axios from 'axios';

const I18N_SERVICE_URL = process.env.I18N_SERVICE_URL;

function getNestedValue(obj: Record<string, any>, path: string): string | undefined {
  if (!path || typeof path !== 'string') return undefined;
  const value = path.split('.').reduce<any>(
    (acc, key) => (acc && typeof acc === 'object' ? acc[key] : undefined),
    obj,
  );
  return typeof value === 'string' ? value : undefined;
}

export const translation = async (code: string, locale = 'pt-BR'): Promise<string> => {
  try {
    if (!I18N_SERVICE_URL) return code;

    const url = `${I18N_SERVICE_URL}/i18n/${locale}/storage-service.json`;
    const { data } = await axios.get<Record<string, any>>(url, { timeout: 2000 });
    const obj = data ?? {};

    const byFlat = obj[code];
    if (typeof byFlat === 'string') return byFlat;

    const byNested = getNestedValue(obj, code);
    if (typeof byNested === 'string') return byNested;

    return code;
  } catch {
    return code;
  }
};
