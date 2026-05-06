import type { Request, Response } from 'express';
import path from 'path';
import { z } from 'zod';
import { resolveTranslation } from '../services/translate.service';

const bodySchema = z.object({
  locale: z.string().min(1),
  namespace: z.string().min(1),
  code: z.string().min(1),
});

export function postInternalTranslate(req: Request, res: Response): void {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: { code: 'VALIDATION_FAILED', message: 'invalid body' } });
    return;
  }

  const I18N_DIR = process.env.I18N_DIR
    ? path.resolve(process.env.I18N_DIR)
    : path.resolve(process.cwd(), 'i18n');

  const result = resolveTranslation(parsed.data, I18N_DIR);
  if (!result.ok) {
    res.status(500).json({ error: { code: 'TRANSLATE_FAILED', message: result.reason } });
    return;
  }
  res.status(200).json({ text: result.text });
}
