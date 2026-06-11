import { logger } from '../config/logging';
import { getRedis } from '../lib/redisClient';

export const CARGO_TYPES_CACHE_KEY = 'freight:cargo-types:all';
export const FREIGHT_STATUS_TYPES_CACHE_KEY = 'freight:status-types:all';

const DEFAULT_CATALOG_TTL_SECONDS = 3600;

export function isCatalogCacheEnabled(): boolean {
  return Boolean(process.env.REDIS_URL);
}

export async function getCachedCatalog<T>(key: string): Promise<T | undefined> {
  if (!isCatalogCacheEnabled()) return undefined;

  try {
    const raw = await getRedis().get(key);
    if (!raw) return undefined;
    return JSON.parse(raw) as T;
  } catch (error) {
    logger.warn('Catalog cache read failed', { key, error });
    return undefined;
  }
}

export async function setCachedCatalog<T>(
  key: string,
  value: T,
  ttlSeconds = DEFAULT_CATALOG_TTL_SECONDS,
): Promise<void> {
  if (!isCatalogCacheEnabled()) return;

  try {
    await getRedis().set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (error) {
    logger.warn('Catalog cache write failed', { key, error });
  }
}

export async function invalidateCatalogCache(key: string): Promise<void> {
  if (!isCatalogCacheEnabled()) return;

  try {
    await getRedis().del(key);
  } catch (error) {
    logger.warn('Catalog cache invalidation failed', { key, error });
  }
}

export async function invalidateCargoTypesCache(): Promise<void> {
  await invalidateCatalogCache(CARGO_TYPES_CACHE_KEY);
}

export async function invalidateFreightStatusTypesCache(): Promise<void> {
  await invalidateCatalogCache(FREIGHT_STATUS_TYPES_CACHE_KEY);
}
