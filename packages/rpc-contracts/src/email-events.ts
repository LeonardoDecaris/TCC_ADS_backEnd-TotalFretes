import { z } from 'zod';

/** Literal `type` no job publicado para reset de senha — manter alinhado em auth + email-management. */
export const EMAIL_EVENT_PASSWORD_RESET = 'password_reset' as const;

export const passwordResetEmailMessageSchema = z.object({
  type: z.literal(EMAIL_EVENT_PASSWORD_RESET),
  email: z.string().email(),
  codigo: z.string().min(1),
});

export type PasswordResetEmailMessage = z.infer<typeof passwordResetEmailMessageSchema>;
