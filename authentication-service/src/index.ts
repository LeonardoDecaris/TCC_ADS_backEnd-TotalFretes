import app from './app';
import dotenv from 'dotenv';
import sequelize from './config/database';
import { seedAccountTypes } from './config/seedAccountTypes';
import { startRpcConsumer } from './messaging/rpc.consumer';
import { registerAccountRpcConsumer } from './messaging/account.rpc.consumer';
import { startEmailPublisher } from './messaging/email.publisher';

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

    registerAccountRpcConsumer();

    await startEmailPublisher();
    console.log('Email publisher started successfully');

    await startRpcConsumer();
    console.log('RPC consumer started successfully');

    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  } catch (err) {
    console.error('error to start the server:', err);
    process.exit(1);
  }
})();