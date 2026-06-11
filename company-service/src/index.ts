import app from './app';
import dotenv from 'dotenv';
import sequelize from './config/database';
import { ensureCompanyAddressCountryColumn } from './database/ensureCompanyAddressCountryColumn';
import { seedDemoCompanies } from './config/seedDemoCompanies';
import { isDemoSeedOnStartupEnabled, loadSharedProjectEnv } from '@total-fretes/demo-seed-data';
import { logger } from './config/logging';
import { logError } from '@total-fretes/logging';

dotenv.config();
loadSharedProjectEnv();

const PORT = process.env.PORT;
if (!PORT) {
  throw new Error('Environment variable PORT is not defined.');
}

(async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database authenticated successfully');

    await sequelize.sync({ alter: false });
    logger.info('Database synchronized successfully');

    await ensureCompanyAddressCountryColumn();
    logger.info('Company address country column ensured successfully');

    if (isDemoSeedOnStartupEnabled()) {
      await seedDemoCompanies();
      logger.info('Demo companies seed completed successfully');
    } else {
      logger.info('Demo companies seed skipped (DEMO_DATA_SEED_ON_STARTUP=false)');
    }

    app.listen(PORT, () => logger.info(`Server is running on port ${PORT}`));
  } catch (err) {
    logError(logger, 'error to start the server', err);
    process.exit(1);
  }
})();
