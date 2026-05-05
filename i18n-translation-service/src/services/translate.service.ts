import fs from 'fs';
import path from 'path';

const getNested = (obj: Record<string, unknown>, key: string): string | undefined => {
  const parts = key.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'string' ? current : undefined;
};

export type TranslateInput = {
  locale: string;
  namespace: string;
  code: string;
};

/** Resolve texto de tradução a partir dos JSONs em I18N_DIR (mesma lógica do antigo handler RPC). */
export function resolveTranslation(
  input: TranslateInput,
  i18nDir: string,
): { ok: true; text: string } | { ok: false; reason: string } {
  const locale = input.locale.trim();
  const namespace = input.namespace.trim();
  const code = input.code.trim();
  if (!locale || !namespace || !code) return { ok: false, reason: 'invalid_payload' };

  const filePath = path.join(i18nDir, locale, `${namespace}.json`);
  if (!fs.existsSync(filePath)) return { ok: true, text: code };

  try {
    const file = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(file) as Record<string, unknown>;
    const translated = getNested(json, code);
    return { ok: true, text: translated ?? code };
  } catch {
    return { ok: false, reason: 'failed_to_resolve' };
  }
}
