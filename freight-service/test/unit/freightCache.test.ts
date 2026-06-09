import {
  buildFreightDetailCacheKey,
  buildFreightListCacheKey,
  buildFreightUserOngoingCacheKey,
  invalidateFreightCache,
  isCacheEnabled,
} from '../../src/cache/freightCache';

const mockDel = jest.fn();
const mockScan = jest.fn();

jest.mock('../../src/lib/redisClient', () => ({
  getRedis: () => ({
    del: mockDel,
    scan: mockScan,
  }),
}));

describe('freightCache', () => {
  const originalRedisUrl = process.env.REDIS_URL;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.REDIS_URL = 'redis://127.0.0.1:6379';
    mockScan.mockResolvedValue(['0', []]);
  });

  afterAll(() => {
    process.env.REDIS_URL = originalRedisUrl;
  });

  it('gera chaves de cache consistentes', () => {
    expect(buildFreightListCacheKey({ role: 'USER', id: 5 }, { paginated: false })).toBe(
      'freight:list:USER:5:all',
    );
    expect(
      buildFreightListCacheKey({ role: 'COMPANY', id: 1 }, { paginated: true, page: 2, limit: 10 }),
    ).toBe('freight:list:COMPANY:1:page:2:10');
    expect(buildFreightDetailCacheKey(42, { role: 'ADMIN', id: 1 })).toBe(
      'freight:detail:42:ADMIN:1',
    );
    expect(buildFreightUserOngoingCacheKey(7)).toBe('freight:user:7:ongoing');
  });

  it('desabilita cache sem REDIS_URL', () => {
    delete process.env.REDIS_URL;
    expect(isCacheEnabled()).toBe(false);
  });

  it('invalida detalhe, listas e frete em andamento do motorista', async () => {
    mockScan
      .mockResolvedValueOnce(['1', ['freight:list:USER:2:all']])
      .mockResolvedValueOnce(['0', ['freight:detail:10:COMPANY:1']]);

    await invalidateFreightCache({
      freightId: 10,
      assignedDriverId: 3,
      previousAssignedDriverId: 2,
    });

    expect(mockDel).toHaveBeenCalledWith('freight:user:3:ongoing', 'freight:user:2:ongoing');
    expect(mockDel).toHaveBeenCalledWith('freight:list:USER:2:all');
    expect(mockDel).toHaveBeenCalledWith('freight:detail:10:COMPANY:1');
  });
});
