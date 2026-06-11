import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive('VALIDATION.ID_INVALID'),
});
