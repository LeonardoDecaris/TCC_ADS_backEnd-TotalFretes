import crypto from 'crypto';

const TTL_MS = 15 * 60 * 1000;

export interface ResetCodeEntry {
  code: string;
  expiresAt: number;
}

const store = new Map<string, ResetCodeEntry>();

const DIGITS = '0123456789';

export function generateResetCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += DIGITS[crypto.randomInt(0, DIGITS.length)];
  }
  return code;
}

export function setResetCode(email: string): string {
  const code = generateResetCode();
  const expiresAt = Date.now() + TTL_MS;
  store.set(email.toLowerCase().trim(), { code, expiresAt });
  return code;
}

export function getAndConsumeResetCode(email: string, code: string): boolean {
  const key = email.toLowerCase().trim();
  const entry = store.get(key);
  if (!entry) return false;
  if (entry.expiresAt < Date.now()) {
    store.delete(key);
    return false;
  }
  if (entry.code !== code.trim()) return false;
  store.delete(key);
  return true;
}
