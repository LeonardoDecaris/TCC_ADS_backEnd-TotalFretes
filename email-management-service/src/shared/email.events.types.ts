/**
 * CONTRACT: same `type` literal as authentication-service `email.events.types`.
 */
export const EMAIL_EVENT_PASSWORD_RESET = 'password_reset' as const;

export type PasswordResetEmailMessage = {
  type: typeof EMAIL_EVENT_PASSWORD_RESET;
  email: string;
  codigo: string;
};

export function parsePasswordResetMessage(
  raw: unknown,
): { email: string; codigo: string } | null {
  if (raw === null || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (o.type !== EMAIL_EVENT_PASSWORD_RESET) return null;
  const email = o.email;
  const codigo = o.codigo;
  if (typeof email !== 'string' || email.length === 0) return null;
  if (typeof codigo !== 'string' || codigo.length === 0) return null;
  return { email, codigo };
}
