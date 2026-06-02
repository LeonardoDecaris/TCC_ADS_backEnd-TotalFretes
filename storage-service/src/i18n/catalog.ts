import fs from 'fs';
import path from 'path';

type TranslationCatalog = Record<string, unknown>;

const catalogs = new Map<string, TranslationCatalog>();

const normalizeLocale = (value: string | undefined): string => {
  if (!value) return 'pt-BR';

  const lower = value.trim().toLowerCase();
  if (lower.startsWith('pt')) return 'pt-BR';
  if (lower.startsWith('en')) return 'en';

  return 'pt-BR';
};

const getNestedValue = (obj: TranslationCatalog, key: string): string | undefined => {
  const value = key.split('.').reduce<unknown>(
    (acc, part) => (acc && typeof acc === 'object' ? (acc as TranslationCatalog)[part] : undefined),
    obj,
  );

  return typeof value === 'string' ? value : undefined;
};

const getCatalogPath = (locale: string): string | undefined => {
  const filename = `${locale}.json`;
  const candidates = [
    path.join(__dirname, 'locales', filename),
    path.join(process.cwd(), 'src', 'i18n', 'locales', filename),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate));
};

const getCatalog = (locale: string): TranslationCatalog => {
  const normalizedLocale = normalizeLocale(locale);
  const cached = catalogs.get(normalizedLocale);
  if (cached) return cached;

  const catalogPath = getCatalogPath(normalizedLocale);
  if (!catalogPath) return {};

  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8')) as TranslationCatalog;
  catalogs.set(normalizedLocale, catalog);

  return catalog;
};

export const translation = async (code: string, locale = 'pt-BR'): Promise<string> => {
  try {
    const catalog = getCatalog(locale);

    const direct = catalog[code];
    if (typeof direct === 'string') return direct;

    const nested = getNestedValue(catalog, code);
    if (typeof nested === 'string') return nested;

    return code;
  } catch {
    return code;
  }
};
