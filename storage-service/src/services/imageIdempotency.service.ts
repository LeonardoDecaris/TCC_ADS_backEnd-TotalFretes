import crypto from 'crypto';
import ImageIdempotency from '../models/imageIdempotency.model';

export type IdempotencyReplay = {
  statusCode: number;
  responseBody: Record<string, unknown> | null;
};

export function normalizeIdempotencyKey(value: string | string[] | undefined): string | null {
  if (!value || Array.isArray(value)) return null;
  const key = value.trim();
  return key.length > 0 ? key : null;
}

export function buildIdempotencyFingerprint(payload: Record<string, unknown>): string {
  const raw = JSON.stringify(payload);
  return crypto.createHash('sha256').update(raw).digest('hex');
}

export async function getIdempotencyReplay(params: {
  key: string;
  scope: string;
  userId: number;
  fingerprint: string;
}): Promise<IdempotencyReplay | null> {
  const existing = await ImageIdempotency.findOne({
    where: {
      key: params.key,
      scope: params.scope,
      userId: params.userId,
    },
  });

  if (!existing) return null;
  if (existing.fingerprint !== params.fingerprint) {
    throw new Error('IDEMPOTENCY_FINGERPRINT_MISMATCH');
  }

  return {
    statusCode: Number(existing.statusCode ?? 200),
    responseBody: (existing.responseBody ?? null) as Record<string, unknown> | null,
  };
}

export async function storeIdempotencyResponse(params: {
  key: string;
  scope: string;
  userId: number;
  fingerprint: string;
  statusCode: number;
  responseBody: Record<string, unknown>;
}): Promise<void> {
  await ImageIdempotency.upsert({
    key: params.key,
    scope: params.scope,
    userId: params.userId,
    fingerprint: params.fingerprint,
    statusCode: params.statusCode,
    responseBody: params.responseBody,
  });
}
