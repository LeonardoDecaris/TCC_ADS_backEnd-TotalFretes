import dotenv from 'dotenv';
import app from './app';
import sequelize from './config/database';
import './models/userImages.model';
import './models/companyImage.model';
import './models/cargoImage.model';
import './models/vehicleImage.model';
import { ensureUserImageOwnershipColumns } from './database/ensureUserImageOwnershipColumns';
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
    await ensureUserImageOwnershipColumns();
    logger.info('User image ownership columns ensured successfully');
    app.listen(PORT, () => logger.info(`Storage service is running on port ${PORT}`));
  } catch (err) {
    logError(logger, 'error to start the server', err);
    process.exit(1);
  }
})();
