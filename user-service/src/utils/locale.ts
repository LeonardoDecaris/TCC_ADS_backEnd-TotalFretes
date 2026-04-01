import { Request } from "express";

const normalizeLocale = (value: string | undefined): string => {
  if (!value) return "pt-BR";

  const raw = value.trim();
  if (!raw) return "pt-BR";

  const lower = raw.toLowerCase();

  if (lower.startsWith("pt")) return "pt-BR";
  if (lower.startsWith("en")) return "en";

  return "pt-BR";
};

export const getLocaleFromRequest = (req: Request): string => {
  if (typeof req.query.lang === "string" && req.query.lang.trim()) {
    return normalizeLocale(req.query.lang);
  }

  if (typeof req.query.locale === "string" && req.query.locale.trim()) {
    return normalizeLocale(req.query.locale);
  }

  const xLocale = req.headers["x-locale"];
  if (typeof xLocale === "string" && xLocale.trim()) {
    return normalizeLocale(xLocale);
  }

  const acceptLanguage = req.headers["accept-language"];
  if (typeof acceptLanguage === "string" && acceptLanguage.trim()) {
    const first = acceptLanguage.split(",")[0].trim();
    return normalizeLocale(first);
  }

  return "pt-BR";
};

