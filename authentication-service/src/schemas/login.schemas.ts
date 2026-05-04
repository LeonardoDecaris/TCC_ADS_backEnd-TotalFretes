import zod from 'zod';

export const loginSchema = zod.object({
  email: zod.string().email({ message: 'AUTH.EMAIL_INVALID' }),
  password: zod.string().min(1, { message: 'AUTH.PASSWORD_REQUIRED' }),
});
