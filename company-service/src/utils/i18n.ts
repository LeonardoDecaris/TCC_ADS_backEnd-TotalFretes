import axios from "axios";

const I18N_SERVICE_URL = process.env.I18N_SERVICE_URL;

const getNestedValue = (obj: Record<string, any>, path: string): string | undefined => {
  return path.split('.').reduce<any>((acc, key) => (acc && typeof acc === 'object' ? acc[key] : undefined), obj);
};

export const translation = async (code: string, locale = "pt-BR"): Promise<string> => {
  try {
    if (!I18N_SERVICE_URL) return code;

    const url = `${I18N_SERVICE_URL}/i18n/${locale}/company-service.json`;
    const { data } = await axios.get<Record<string, any>>(url, { timeout: 2000 });

    const translated = getNestedValue(data ?? {}, code);
    return typeof translated === 'string' ? translated : code;
  } catch (error) {
    return code;
  }
};