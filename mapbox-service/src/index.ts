import dotenv from 'dotenv';
import { logError } from '@total-fretes/logging';
import sequelize from './config/database';
import { logger } from './config/logging';
import './models/driverLocation.model';
import { createServer } from './server';

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 3004;

(async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database authenticated successfully');

    await sequelize.sync({ alter: false });
    logger.info('Database synchronized successfully');

    const server = createServer();
    server.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
    });

    const shutdown = (signal: string) => {
      logger.info(`Received ${signal}, shutting down...`);
      server.close(() => process.exit(0));
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    logError(logger, 'error to start the server', err);
    process.exit(1);
  }
})();
