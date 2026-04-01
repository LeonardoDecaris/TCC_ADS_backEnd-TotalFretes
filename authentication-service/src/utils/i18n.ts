import axios from "axios";

const I18N_SERVICE_URL = process.env.I18N_SERVICE_URL;

/** Resolve valor em objeto aninhado por chave com pontos (ex: "AUTH.LOGIN_SUCCESSFUL"). */
const getNested = (obj: Record<string, unknown>, key: string): string | undefined => {
  const parts = key.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : undefined;
};

export const translation = async (code: string, locale = "pt-BR"): Promise<string> => {
  try {
    if (!I18N_SERVICE_URL) return code;

    const url = `${I18N_SERVICE_URL}/i18n/${locale}/authentication-service.json`;
    const { data } = await axios.get<Record<string, unknown>>(url, { timeout: 2000 });

    if (!data) return code;
    return getNested(data, code) ?? code;
  } catch {
    return code;
  }
};

