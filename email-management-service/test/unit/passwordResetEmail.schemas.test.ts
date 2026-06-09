import {
  EMAIL_EVENT_PASSWORD_RESET,
  passwordResetEmailMessageSchema,
} from '@total-fretes/rpc-contracts';

describe('passwordResetEmailMessageSchema', () => {
  it('aceita job válido de reset de senha', () => {
    const result = passwordResetEmailMessageSchema.safeParse({
      type: EMAIL_EVENT_PASSWORD_RESET,
      email: 'user@test.com',
      codigo: '123456',
    });
    expect(result.success).toBe(true);
  });

  it('rejeita type incorreto', () => {
    const result = passwordResetEmailMessageSchema.safeParse({
      type: 'outro_evento',
      email: 'user@test.com',
      codigo: '123456',
    });
    expect(result.success).toBe(false);
  });

  it('rejeita email inválido', () => {
    const result = passwordResetEmailMessageSchema.safeParse({
      type: EMAIL_EVENT_PASSWORD_RESET,
      email: 'invalido',
      codigo: '123456',
    });
    expect(result.success).toBe(false);
  });
});
