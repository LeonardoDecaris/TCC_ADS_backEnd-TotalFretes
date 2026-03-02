import axios from "axios";

const I18N_SERVICE_URL = process.env.I18N_SERVICE_URL;

export const translation = async (code: string, locale = "pt-BR"): Promise<string> => {
  try {
    const url = `${I18N_SERVICE_URL}/i18n/${locale}/user-service.json`;
    const { data } = await axios.get<Record<string, string>>(url, { timeout: 2000 });
    return data?.[code] || code;
  } catch (error) {
    return code;
  }
};