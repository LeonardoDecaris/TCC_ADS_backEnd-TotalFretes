import AccountType from '../models/accounts_types.model';

const DEFAULT_ACCOUNT_TYPES = ['USER', 'COMPANY', 'ADMIN'];

export const seedAccountTypes = async (): Promise<void> => {
  for (const name of DEFAULT_ACCOUNT_TYPES) {
    await AccountType.findOrCreate({
      where: { name },
      defaults: { name },
    });
  }
};
