/**
 * authentication-service/src/services/accountCreation.service.ts
 */

import bcrypt from 'bcrypt';
import { Account } from '../models/accounts.model';
import AccountType from '../models/accounts_types.model';

export type AccountCreationInput = {
  email: string;
  password: string;
  subject_id: number;
  account_type_id: number;
};

export type AccountCreationResult =
  | { ok: true }
  | { ok: false; reason: 'exists' | 'error' };

export type AdminAccountCreationResult =
  | { ok: true; account: Account }
  | { ok: false; reason: 'exists' | 'admin_type_missing' | 'error' };

/** Persistência após validação no boundary HTTP/RPC (contratos Zod). */
export async function createAccountRecord(
  input: AccountCreationInput,
): Promise<AccountCreationResult> {
  const { email, password, subject_id, account_type_id } = input;

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

export async function createAdminAccountRecord(input: {
  email: string;
  password: string;
}): Promise<AdminAccountCreationResult> {
  const email = input.email.trim().toLowerCase();
  const { password } = input;

  const existing = await Account.findOne({ where: { email } });
  if (existing) return { ok: false, reason: 'exists' };

  const adminType = await AccountType.findOne({ where: { name: 'ADMIN' } });
  if (!adminType?.id) return { ok: false, reason: 'admin_type_missing' };

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const account = await Account.create({
      email,
      password: hashedPassword,
      account_type_id: adminType.id,
      subject_id: 1,
    });

    await account.update({ subject_id: account.id });

    const reloaded = await Account.findByPk(account.id, {
      include: [{ model: AccountType, required: false }],
    });

    if (!reloaded) return { ok: false, reason: 'error' };

    return { ok: true, account: reloaded };
  } catch {
    return { ok: false, reason: 'error' };
  }
}

export function serializeAccountPublic(account: Account) {
  const json = account.toJSON() as Record<string, unknown>;
  delete json.password;
  return json;
}
