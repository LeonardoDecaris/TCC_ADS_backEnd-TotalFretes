import request from 'supertest';

jest.mock('../../src/config/database', () => ({
  __esModule: true,
  default: {
    authenticate: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../../src/lib/redisClient', () => ({
  checkRedis: jest.fn().mockResolvedValue(true),
}));

import app from '../../src/app';

describe('GET /health', () => {
  it('retorna status 200 quando banco e redis estão disponíveis', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('up');
  });
});
