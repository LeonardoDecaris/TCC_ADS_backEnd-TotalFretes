import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";

const app = express();
app.use(cors());

// onde ficam os JSONs
const I18N_DIR = process.env.I18N_DIR
  ? path.resolve(process.env.I18N_DIR)
  : path.resolve(process.cwd(), "i18n");

// Healthcheck
app.get("/health", (_req, res) => res.json({ ok: true }));

// (Opcional) Meta para cache/versionamento simples
// Retorna lista de arquivos e "lastModified" (bom o suficiente pro TCC)
app.get("/i18n/meta", (_req, res) => {
  const locales = fs.existsSync(I18N_DIR) ? fs.readdirSync(I18N_DIR) : [];
  const meta: any = {};

  for (const locale of locales) {
    const localeDir = path.join(I18N_DIR, locale);
    if (!fs.statSync(localeDir).isDirectory()) continue;

    const files = fs.readdirSync(localeDir).filter(f => f.endsWith(".json"));
    meta[locale] = {};

    for (const file of files) {
      const full = path.join(localeDir, file);
      const stat = fs.statSync(full);
      meta[locale][file] = { lastModified: stat.mtimeMs, size: stat.size };
    }
  }

  res.json(meta);
});

// Serve arquivos estáticos em /i18n/...
// Ex.: GET /i18n/pt-BR/errors.json
app.use(
  "/i18n",
  express.static(I18N_DIR, {
    extensions: ["json"],
    fallthrough: false,
    setHeaders: (res) => {
      // cache leve em dev; em prod você ajusta melhor
      res.setHeader("Cache-Control", "public, max-age=60");
    },
  })
);

// Tratamento de 404 para arquivos inexistentes
app.use((err: any, _req: any, res: any, _next: any) => {
  if (err?.status === 404) {
    return res.status(404).json({ error: { code: "I18N_NOT_FOUND", message: "Translation file not found" } });
  }
  return res.status(500).json({ error: { code: "I18N_INTERNAL", message: "Internal error" } });
});

const port = process.env.PORT ? Number(process.env.PORT) : 8088;
app.listen(port, () => console.log(`i18n-service listening on ${port}`));