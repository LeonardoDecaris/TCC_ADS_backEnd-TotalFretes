/**
 * authentication-service/src/services/accountCreation.service.ts
 */

import bcrypt from 'bcrypt';
import { Account } from '../models/accounts.model';
import { accountSchema } from '../schemas/account.schemas';

export type AccountCreationInput = {
  email: string;
  password: string;
  subject_id: number;
  account_type_id: number;
};

export type AccountCreationResult =
  | { ok: true }
  | { ok: false; reason: 'validation' | 'exists' | 'error' };

export async function createAccountRecord(
  input: AccountCreationInput,
): Promise<AccountCreationResult> {
  const parsed = accountSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: 'validation' };

  const { email, password, subject_id, account_type_id } = parsed.data;

  const existing = await Account.findOne({ where: { email } });
  if (existing) return { ok: false, reason: 'exists' };

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await Account.create({ email, password: hashedPassword, account_type_id, subject_id });
    return { ok: true };
  } catch {
    return { ok: false, reason: 'error' };
  }
}