import dotenv from 'dotenv';
import sequelize from './config/database';
import { logger } from './config/logger';
import { startNotificationConsumer, stopNotificationConsumer } from './consumer';
import './models/notification.model';
import { createServer } from './server';
import { logError } from './utils/logError';

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

    await startNotificationConsumer();
    logger.info('Notification consumer started successfully');

    const server = createServer();
    server.listen(Number(PORT), () => {
      logger.info(`Server is running on port ${PORT}`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down...`);
      await stopNotificationConsumer();
      server.close(() => process.exit(0));
    };

    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('SIGINT', () => void shutdown('SIGINT'));
  } catch (err) {
    logError(logger, 'error to start the server', err);
    process.exit(1);
  }
})();
