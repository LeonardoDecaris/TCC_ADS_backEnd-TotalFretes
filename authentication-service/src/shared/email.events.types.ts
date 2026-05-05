/**
 * Password-reset e-mail job (published to RabbitMQ, consumed by email-management-service).
 * CONTRACT: keep message `type` in sync with email-management-service.
 */
export const EMAIL_EVENT_PASSWORD_RESET = 'password_reset' as const;

export type PasswordResetEmailMessage = {
  type: typeof EMAIL_EVENT_PASSWORD_RESET;
  email: string;
  codigo: string;
};
