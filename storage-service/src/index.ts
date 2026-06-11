import dotenv from 'dotenv';
import app from './app';
import sequelize from './config/database';
import './models/userImages.model';
import './models/companyImage.model';
import './models/cargoImage.model';
import './models/imageOutboxEvent.model';
import './models/imageIdempotency.model';
import { ensureUserImageOwnershipColumns } from './database/ensureUserImageOwnershipColumns';
import { logger } from './config/logging';
import { logError } from '@total-fretes/logging';
import { startImageOutboxPublisher, stopImageOutboxPublisher } from './messaging/imageOutbox.publisher';
import { startStorageReconciliationJob, stopStorageReconciliationJob } from './jobs/storageReconciliation.job';
import { isDemoSeedOnStartupEnabled, loadSharedProjectEnv } from '@total-fretes/demo-seed-data';
import { seedDemoCargoImages } from './config/seedDemoImages';

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
    await ensureUserImageOwnershipColumns();
    logger.info('User image ownership columns ensured successfully');
    if (isDemoSeedOnStartupEnabled()) {
      await seedDemoCargoImages();
      logger.info('Demo cargo images seed completed');
    } else {
      logger.info('Demo cargo images seed skipped (DEMO_DATA_SEED_ON_STARTUP=false)');
    }
    await startImageOutboxPublisher();
    startStorageReconciliationJob();
    app.listen(PORT, () => logger.info(`Storage service is running on port ${PORT}`));
  } catch (err) {
    logError(logger, 'error to start the server', err);
    process.exit(1);
  }
})();

const shutdown = async () => {
  stopStorageReconciliationJob();
  await stopImageOutboxPublisher();
};

process.on('SIGINT', () => {
  void shutdown().finally(() => process.exit(0));
});
process.on('SIGTERM', () => {
  void shutdown().finally(() => process.exit(0));
});
