import { z } from 'zod';

export const accountCreateRequestSchema = z.object({
  email: z.string().email(),
  subject_id: z.number().int().positive(),
  account_type_id: z.number().int().positive(),
  password: z.string().min(8),
});

export type AccountCreateRequest = z.infer<typeof accountCreateRequestSchema>;
