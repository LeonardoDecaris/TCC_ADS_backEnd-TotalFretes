import { getI18nHttp } from '../services/service';




function getNestedValue(obj: Record<string, any>, path: string): string | undefined {
  if (!path || typeof path !== 'string') return undefined;
  const value = path.split('.').reduce<any>(
    (acc, key) => (acc && typeof acc === 'object' ? acc[key] : undefined),
    obj,
  );
  return typeof value === 'string' ? value : undefined;
}

export const translation = async (code: string, locale = 'pt-BR'): Promise<string> => {
  if (!process.env.I18N_SERVICE_URL) return code;

  const data = await getI18nHttp({ locale: locale || 'pt-BR' });

  const byFlat = data[code];
  if (typeof byFlat === 'string') return byFlat;

  const byNested = getNestedValue(data, code);
  if (typeof byNested === 'string') return byNested;

  return code;
};