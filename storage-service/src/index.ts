import dotenv from 'dotenv';
import app from './app';
import sequelize from './config/database';
import './models/userImages.model';
import { ensureUserImageOwnershipColumns } from './database/ensureUserImageOwnershipColumns';

dotenv.config();

const PORT = process.env.PORT;
if (!PORT) {
  throw new Error('Environment variable PORT is not defined.');
}

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database authenticated successfully');
    await sequelize.sync({ alter: false });
    console.log('Database synchronized successfully');
    await ensureUserImageOwnershipColumns();
    console.log('User image ownership columns ensured successfully');
    app.listen(PORT, () => console.log(`Storage service is running on port ${PORT}`));
  } catch (err) {
    console.error('error to start the server:', err);
    process.exit(1);
  }
})();
