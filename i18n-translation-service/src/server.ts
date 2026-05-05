import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { internalServiceAuth } from './middleware/internalServiceAuth';
import { postInternalTranslate } from './controllers/internalTranslate.controller';

const app = express();
app.use(cors());
app.use(express.json());

const I18N_DIR = process.env.I18N_DIR
  ? path.resolve(process.env.I18N_DIR)
  : path.resolve(process.cwd(), 'i18n');

app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/i18n/meta', (_req, res) => {
  const locales = fs.existsSync(I18N_DIR) ? fs.readdirSync(I18N_DIR) : [];
  const meta: Record<string, Record<string, { lastModified: number; size: number }>> = {};

  for (const locale of locales) {
    const localeDir = path.join(I18N_DIR, locale);
    if (!fs.statSync(localeDir).isDirectory()) continue;

    const files = fs.readdirSync(localeDir).filter((f) => f.endsWith('.json'));
    meta[locale] = {};

    for (const file of files) {
      const full = path.join(localeDir, file);
      const stat = fs.statSync(full);
      meta[locale][file] = { lastModified: stat.mtimeMs, size: stat.size };
    }
  }

  res.json(meta);
});

app.use(
  '/i18n',
  express.static(I18N_DIR, {
    extensions: ['json'],
    fallthrough: false,
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'public, max-age=60');
    },
  }),
);

app.post('/internal/translate', internalServiceAuth, postInternalTranslate);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err && typeof err === 'object' && 'status' in err ? Number((err as { status?: number }).status) : 500;
  if (status === 404) {
    return res.status(404).json({ error: { code: 'I18N_NOT_FOUND', message: 'Translation file not found' } });
  }
  return res.status(500).json({ error: { code: 'I18N_INTERNAL', message: 'Internal error' } });
});

const port = process.env.PORT ? Number(process.env.PORT) : 3006;
app.listen(port, () => {
  console.log(`i18n-service listening on ${port}`);
});
