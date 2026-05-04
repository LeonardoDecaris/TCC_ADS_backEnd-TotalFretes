import zod from 'zod';

export const accountSchema = zod.object({
  email: zod.string().email({ message: 'Invalid email address' }),
  subject_id: zod.number(),
  account_type_id: zod.number(),
  password: zod.string().min(8, { message: 'Password must be at least 8 characters' }),
}); 