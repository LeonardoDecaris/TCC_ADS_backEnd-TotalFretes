import app from './app';
import dotenv from 'dotenv';
import sequelize from './config/database';
import { seedAccountTypes } from './config/seedAccountTypes';
import { startAccountRpcConsumer } from './messaging/account.rpc.consumer';

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

    await seedAccountTypes();
    console.log('Account types verified successfully');

    await startAccountRpcConsumer();
    console.log('Account RPC consumer started successfully');

    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  } catch (err) {
    console.error('error to start the server:', err);
    process.exit(1);
  }
})();