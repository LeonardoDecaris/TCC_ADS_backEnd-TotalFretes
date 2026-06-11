import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';

export type LoadTestEnvOptions = {
  serviceRoot?: string;
  globalRoot?: string;
};

const TEST_DEFAULTS: Record<string, string> = {
  JWT_SECRET: 'test-jwt-secret-totalfretes-suite',
  NODE_ENV: 'test',
  DB_NAME: 'test_db',
  DB_USER: 'root',
  DB_PASS: 'test',
  DB_HOST: '127.0.0.1',
  DB_PORT: '3306',
  PORT: '3000',
  REDIS_URL: 'redis://127.0.0.1:6379',
  RABBITMQ_URL: 'amqp://guest:guest@127.0.0.1:5672',
  INTERNAL_SERVICE_KEY: 'test-internal-service-key',
  LOKI_HOST: 'http://127.0.0.1:3100',
  LOG_LEVEL: 'error',
};

function loadEnvFile(filePath: string): void {
  if (fs.existsSync(filePath)) {
    config({ path: filePath, override: false });
  }
}

export function loadTestEnv(options: LoadTestEnvOptions = {}): void {
  const cwd = options.serviceRoot ?? process.cwd();
  const repoRoot = options.globalRoot ?? path.resolve(cwd, '..');

  loadEnvFile(path.join(repoRoot, '.env.test'));
  loadEnvFile(path.join(cwd, '.env.test'));
  loadEnvFile(path.join(cwd, '.env'));

  for (const [key, value] of Object.entries(TEST_DEFAULTS)) {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}
