import app from './app';
import dotenv from 'dotenv';
import sequelize from './config/database';
import { seedCnhTypes } from './config/seedCnh';
import { seedGroupVehicleType } from './config/seedGrupVehicleType';
import { seedVehicleType } from './config/seedVehicleType';

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
    await seedCnhTypes();
    await seedGroupVehicleType();
    console.log('Group vehicle types seeded successfully');
    await seedVehicleType();
    console.log('Vehicle types seeded successfully');
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  } catch (err) {
    console.error('error to start the server:', err);
    process.exit(1);
  }
})();