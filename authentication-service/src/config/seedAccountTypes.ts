import AccountType from '../models/accounts_types.model';

const DEFAULT_ACCOUNT_TYPES = ['USER', 'COMPANY', 'ADMIN'];

/**
 * Garante que os tipos de conta padrão existam na inicialização.
 * Permite que a tela de account_type tenha sempre dados disponíveis.
 */
export const seedAccountTypes = async (): Promise<void> => {
  for (const name of DEFAULT_ACCOUNT_TYPES) {
    await AccountType.findOrCreate({
      where: { name },
      defaults: { name },
    });
  }
};
