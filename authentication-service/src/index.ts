import app from './app';
import dotenv from 'dotenv';
import sequelize from './config/database';
import { seedAccountTypes } from './config/seedAccountTypes';
import { seedDefaultAdmin } from './config/seedDefaultAdmin';
import { startEmailPublisher } from './messaging/email.publisher';
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

    await seedAccountTypes();
    logger.info('Account types verified successfully');

    await seedDefaultAdmin();
    logger.info('Default admin account verified successfully');

    await startEmailPublisher();
    logger.info('Email publisher started successfully');

    app.listen(PORT, () => logger.info(`Server is running on port ${PORT}`));
  } catch (err) {
    logError(logger, 'error to start the server', err);
    process.exit(1);
  }
})();
