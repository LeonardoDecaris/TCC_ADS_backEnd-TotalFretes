import 'dotenv/config';
import app from './app';
import sequelize from './config/database';
import { seedAccountTypes } from './config/seedAccountTypes';
import { getRedis, closeRedis } from './lib/redisClient';
import { initEmailPublisher, closeEmailPublisher } from './messaging/email.publisher';
import { initAccountRpcConsumer, closeAccountRpcConsumer } from './messaging/account.rpc.consumer';

const PORT = process.env.PORT;
if (!PORT) {
  throw new Error('Environment variable PORT is not defined.');
}

async function shutdown(signal: string) {
  console.info(`${signal} received, shutting down`);
  try {
    await closeAccountRpcConsumer();
  } catch (e) {
    console.error('Error closing RabbitMQ account RPC:', e);
  }
  try {
    await closeEmailPublisher();
  } catch (e) {
    console.error('Error closing RabbitMQ:', e);
  }
  try {
    await closeRedis();
  } catch (e) {
    console.error('Error closing Redis:', e);
  }
  process.exit(0);
}

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database authenticated successfully');
    await sequelize.sync({ alter: false });
    console.log('Database synchronized successfully');
    await seedAccountTypes();
    console.log('Account types verified successfully');
    await getRedis().ping();
    console.log('Redis connection OK');
    await initEmailPublisher();
    console.log('RabbitMQ email publisher ready');
    await initAccountRpcConsumer();
    console.log('RabbitMQ account RPC consumer ready');
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
    process.once('SIGTERM', () => {
      void shutdown('SIGTERM');
    });
    process.once('SIGINT', () => {
      void shutdown('SIGINT');
    });
  } catch (err) {
    console.error('error to start the server:', err);
    process.exit(1);
  }
})();