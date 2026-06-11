import app from './app';
import dotenv from 'dotenv';
import sequelize from './config/database';
import { seedCnhTypes } from './config/seedCnh';
import { seedGroupVehicleType } from './config/seedGrupVehicleType';
import { seedVehicleType } from './config/seedVehicleType';
import { seedDemoDrivers } from './config/seedDemoDrivers';
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

    await seedCnhTypes();
    logger.info('CNH types seeded successfully');

    await seedGroupVehicleType();
    logger.info('Group vehicle types seeded successfully');

    await seedVehicleType();
    logger.info('Vehicle types seeded successfully');

    if (isDemoSeedOnStartupEnabled()) {
      await seedDemoDrivers();
      logger.info('Demo drivers seed completed successfully');
    } else {
      logger.info('Demo drivers seed skipped (DEMO_DATA_SEED_ON_STARTUP=false)');
    }

    app.listen(PORT, () => logger.info(`Server is running on port ${PORT}`));
  } catch (err) {
    logError(logger, 'error to start the server', err);
    process.exit(1);
  }
})();
