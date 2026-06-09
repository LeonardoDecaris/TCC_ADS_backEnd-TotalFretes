import app from './app';
import dotenv from 'dotenv';
import sequelize from './config/database';
import { ensureCompanyAddressCountryColumn } from './database/ensureCompanyAddressCountryColumn';
import { seedDefaultCompany } from './config/seedDefaultCompany';
import { logger } from './config/logging';
import { logError } from '@total-fretes/logging';

dotenv.config();

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

    await seedDefaultCompany();
    logger.info('Default company account verified successfully');

    app.listen(PORT, () => logger.info(`Server is running on port ${PORT}`));
  } catch (err) {
    logError(logger, 'error to start the server', err);
    process.exit(1);
  }
})();
