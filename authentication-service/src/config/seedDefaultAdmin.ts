import { Account } from '../models/accounts.model';
import AccountType from '../models/accounts_types.model';
import { createAdminAccountRecord } from '../services/accountCreation.service';
import { logger } from '../config/logger';

const DEFAULT_ADMIN_EMAIL = 'admin@totalfretes.com.br';
const DEFAULT_ADMIN_PASSWORD = 'Admin@123456';

function isSeedEnabled(): boolean {
  const raw = process.env.ADMIN_SEED_ENABLED?.trim().toLowerCase();
  if (raw === 'false' || raw === '0') return false;
  return true;
}

export async function seedDefaultAdmin(): Promise<void> {
  if (!isSeedEnabled()) {
    logger.info('Default admin seed skipped (ADMIN_SEED_ENABLED=false)');
    return;
  }

  const adminType = await AccountType.findOne({ where: { name: 'ADMIN' } });
  if (!adminType?.id) {
    logger.warn('Default admin seed skipped: ADMIN account type not found');
    return;
  }

  const existingAdmin = await Account.findOne({
    where: { account_type_id: adminType.id },
    include: [{ model: AccountType, required: true, where: { name: 'ADMIN' } }],
  });

  if (existingAdmin) {
    if (existingAdmin.id && existingAdmin.subject_id !== existingAdmin.id) {
      await existingAdmin.update({ subject_id: existingAdmin.id });
      logger.info('Default admin account subject_id repaired');
    }
    logger.info('Default admin account already exists');
    return;
  }

  const email = (process.env.ADMIN_SEED_EMAIL?.trim() || DEFAULT_ADMIN_EMAIL).toLowerCase();
  const password = process.env.ADMIN_SEED_PASSWORD?.trim() || DEFAULT_ADMIN_PASSWORD;

  const emailTaken = await Account.findOne({ where: { email } });
  if (emailTaken) {
    logger.warn(`Default admin seed skipped: email already in use (${email})`);
    return;
  }

  const result = await createAdminAccountRecord({ email, password });
  if (!result.ok) {
    logger.error(`Default admin seed failed: ${result.reason}`);
    return;
  }

  logger.info(`Default admin account created for ${email}`);
}
