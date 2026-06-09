import { getRedis } from '../lib/redisClient';
import { logger } from '../config/logging';

const CACHE_PREFIX = 'freight';
const DEFAULT_TTL_SECONDS = 3600;

export function isCacheEnabled(): boolean {
  return Boolean(process.env.REDIS_URL);
}

export function buildFreightListCacheKey(
  user: { role?: string; id?: number } | undefined,
  options: { paginated: boolean; page?: number; limit?: number },
): string {
  const role = user?.role ?? 'ANON';
  const userId = user?.id ?? 0;

  if (options.paginated) {
    return `${CACHE_PREFIX}:list:${role}:${userId}:page:${options.page ?? 1}:${options.limit ?? 20}`;
  }

  return `${CACHE_PREFIX}:list:${role}:${userId}:all`;
}

export function buildFreightDetailCacheKey(
  freightId: number,
  user?: { role?: string; id?: number },
): string {
  const role = user?.role ?? 'ANON';
  const userId = user?.id ?? 0;
  return `${CACHE_PREFIX}:detail:${freightId}:${role}:${userId}`;
}

export function buildFreightUserOngoingCacheKey(userId: string | number): string {
  return `${CACHE_PREFIX}:user:${userId}:ongoing`;
}

export async function getCached<T>(key: string): Promise<T | undefined> {
  if (!isCacheEnabled()) return undefined;

  try {
    const raw = await getRedis().get(key);
    if (raw === null) return undefined;
    return JSON.parse(raw) as T;
  } catch (error) {
    logger.warn('Freight cache read failed', { key, error });
    return undefined;
  }
}

export async function setCached<T>(
  key: string,
  value: T,
  ttlSeconds = DEFAULT_TTL_SECONDS,
): Promise<void> {
  if (!isCacheEnabled()) return;

  try {
    await getRedis().set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (error) {
    logger.warn('Freight cache write failed', { key, error });
  }
}

async function deleteKeysByPattern(pattern: string): Promise<void> {
  const redis = getRedis();
  let cursor = '0';

  do {
    const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
    cursor = nextCursor;
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } while (cursor !== '0');
}

export type FreightCacheInvalidationContext = {
  freightId?: number | null;
  assignedDriverId?: number | string | null;
  previousAssignedDriverId?: number | string | null;
};

export async function invalidateFreightCache(
  context: FreightCacheInvalidationContext = {},
): Promise<void> {
  if (!isCacheEnabled()) return;

  try {
    const keysToDelete = new Set<string>();

    if (context.freightId != null) {
      await deleteKeysByPattern(`${CACHE_PREFIX}:detail:${context.freightId}:*`);
    }

    for (const driverId of [context.assignedDriverId, context.previousAssignedDriverId]) {
      if (driverId != null && driverId !== '') {
        keysToDelete.add(buildFreightUserOngoingCacheKey(driverId));
      }
    }

    if (keysToDelete.size > 0) {
      await getRedis().del(...keysToDelete);
    }

    await deleteKeysByPattern(`${CACHE_PREFIX}:list:*`);
  } catch (error) {
    logger.warn('Freight cache invalidation failed', { context, error });
  }
}
