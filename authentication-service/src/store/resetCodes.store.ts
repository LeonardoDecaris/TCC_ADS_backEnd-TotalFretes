import crypto from 'crypto';
import { getRedis } from '../lib/redisClient';

const TTL_SEC = 15 * 60;
const KEY_PREFIX = 'auth:reset:';

const CONSUME_LUA = `
local v = redis.call('GET', KEYS[1])
if not v then return 0 end
if v ~= ARGV[1] then return 0 end
redis.call('DEL', KEYS[1])
return 1
`;

const DIGITS = '0123456789';

function redisKey(email: string): string {
  return `${KEY_PREFIX}${email.toLowerCase().trim()}`;
}

export function generateResetCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += DIGITS[crypto.randomInt(0, DIGITS.length)];
  }
  return code;
}

export async function setResetCode(email: string): Promise<string> {
  const code = generateResetCode();
  await getRedis().set(redisKey(email), code, 'EX', TTL_SEC);
  return code;
}

export async function getAndConsumeResetCode(email: string, code: string): Promise<boolean> {
  const n = (await getRedis().eval(
    CONSUME_LUA,
    1,
    redisKey(email),
    code.trim()
  )) as number | string;
  return Number(n) === 1;
}
