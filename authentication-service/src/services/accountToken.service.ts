import { Account } from '../models/accounts.model';
import AccountType from '../models/accounts_types.model';
import type { JwtRole } from '../utils/jwt';

export async function findAccountByTokenClaims(
  claims: { id?: number; role?: JwtRole },
): Promise<Account | null> {
  if (!claims.id || !claims.role) return null;

  const accountType = await AccountType.findOne({ where: { name: claims.role } });
  if (!accountType?.id) return null;

  if (claims.role === 'ADMIN') {
    return Account.findOne({
      where: { id: claims.id, account_type_id: accountType.id },
    });
  }

  return Account.findOne({
    where: { subject_id: claims.id, account_type_id: accountType.id },
  });
}

export function resolveTokenSubjectId(
  account: Account,
  accountTypeName?: string,
): number | undefined {
  if (accountTypeName === 'ADMIN') return account.id;
  return account.subject_id;
}
