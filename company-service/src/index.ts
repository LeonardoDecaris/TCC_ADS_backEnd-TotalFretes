import app from './app';
import dotenv from 'dotenv';
import sequelize from './config/database';
import { ensureCompanyAddressCountryColumn } from './database/ensureCompanyAddressCountryColumn';
import { logger } from './config/logger';
import { logError } from '@total-fretes/observability';

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

    app.listen(PORT, () => logger.info(`Server is running on port ${PORT}`));
  } catch (err) {
    logError(logger, 'error to start the server', err);
    process.exit(1);
  }
})();
