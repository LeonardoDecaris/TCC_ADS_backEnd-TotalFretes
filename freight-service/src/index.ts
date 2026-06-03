import app from './app';
import dotenv from 'dotenv';
import sequelize from './config/database';
import './models/associations';
import { runDatabaseSeeds } from './config/runDatabaseSeeds';
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
    await runDatabaseSeeds();
    logger.info('Database seeds completed successfully (catalogs + test freights/proposals)');

    app.listen(PORT, () => logger.info(`Server is running on port ${PORT}`));
  } catch (err) {
    logError(logger, 'error to start the server', err);
    process.exit(1);
  }
})();
