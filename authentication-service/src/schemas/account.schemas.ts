import zod from 'zod';

export const accountSchema = zod.object({
  email: zod.string().email(),
  subject_id: zod.number(),
  account_type_id: zod.number(),
  password: zod.string().min(8),
}); 