import { config } from 'dotenv';
import path from 'path';

const repoRoot = path.resolve(__dirname, '../../..');
config({ path: path.join(repoRoot, '.env.test'), override: false });

process.env.API_BASE_URL ??= 'http://localhost:80';
process.env.JWT_SECRET ??= 'test-jwt-secret-totalfretes-suite';
