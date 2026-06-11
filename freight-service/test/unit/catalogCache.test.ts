import {
  CARGO_TYPES_CACHE_KEY,
  FREIGHT_STATUS_TYPES_CACHE_KEY,
  getCachedCatalog,
  invalidateCargoTypesCache,
  invalidateFreightStatusTypesCache,
  isCatalogCacheEnabled,
  setCachedCatalog,
} from '../../src/cache/catalogCache';

const redisMock = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

jest.mock('../../src/lib/redisClient', () => ({
  getRedis: () => redisMock,
}));

describe('catalogCache', () => {
  const originalRedisUrl = process.env.REDIS_URL;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.REDIS_URL = 'redis://127.0.0.1:6379';
  });

  afterAll(() => {
    process.env.REDIS_URL = originalRedisUrl;
  });

  it('desabilita cache sem REDIS_URL', () => {
    delete process.env.REDIS_URL;
    expect(isCatalogCacheEnabled()).toBe(false);
  });

  it('lê e grava catálogo no Redis', async () => {
    redisMock.get.mockResolvedValueOnce(JSON.stringify([{ id: 1, name: 'Granel' }]));

    const cached = await getCachedCatalog<unknown[]>(CARGO_TYPES_CACHE_KEY);
    expect(cached).toEqual([{ id: 1, name: 'Granel' }]);

    await setCachedCatalog(CARGO_TYPES_CACHE_KEY, [{ id: 2, name: 'Carga Seca' }]);
    expect(redisMock.set).toHaveBeenCalledWith(
      CARGO_TYPES_CACHE_KEY,
      JSON.stringify([{ id: 2, name: 'Carga Seca' }]),
      'EX',
      3600,
    );
  });

  it('invalida chaves de catálogo', async () => {
    await invalidateCargoTypesCache();
    await invalidateFreightStatusTypesCache();

    expect(redisMock.del).toHaveBeenCalledWith(CARGO_TYPES_CACHE_KEY);
    expect(redisMock.del).toHaveBeenCalledWith(FREIGHT_STATUS_TYPES_CACHE_KEY);
  });
});
