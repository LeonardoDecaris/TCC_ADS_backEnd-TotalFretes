import { config } from 'dotenv';
import path from 'path';

const serviceRoot = path.resolve(__dirname, '../..');
const repoRoot = path.resolve(serviceRoot, '..');

config({ path: path.join(repoRoot, '.env.test'), override: false });
config({ path: path.join(serviceRoot, '.env.test'), override: false });

process.env.PORT ??= '3005';
process.env.NODE_ENV ??= 'test';
process.env.LOG_LEVEL ??= 'error';
process.env.LOKI_HOST ??= 'http://127.0.0.1:3100';
