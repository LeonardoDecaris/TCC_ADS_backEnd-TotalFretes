import { config } from 'dotenv';
import path from 'path';

const serviceRoot = path.resolve(__dirname, '../..');
const repoRoot = path.resolve(serviceRoot, '..');

config({ path: path.join(repoRoot, '.env.test'), override: false });
config({ path: path.join(serviceRoot, '.env.test'), override: false });

const defaults: Record<string, string> = {
  JWT_SECRET: 'test-jwt-secret-totalfretes-suite',
  NODE_ENV: 'test',
  DB_NAME: 'test_db',
  DB_USER: 'root',
  DB_PASS: 'test',
  DB_HOST: '127.0.0.1',
  REDIS_URL: 'redis://127.0.0.1:6379',
  RABBITMQ_URL: 'amqp://guest:guest@127.0.0.1:5672',
  PORT: '3000',
  LOKI_HOST: 'http://127.0.0.1:3100',
  LOG_LEVEL: 'error',
};

for (const [key, value] of Object.entries(defaults)) {
  if (!process.env[key]) process.env[key] = value;
}
