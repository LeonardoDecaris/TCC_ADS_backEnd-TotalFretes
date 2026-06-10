import request from 'supertest';

jest.mock('../../src/config/database', () => ({
  __esModule: true,
  default: {
    authenticate: jest.fn().mockResolvedValue(undefined),
  },
}));

import app from '../../src/app';

describe('GET /health', () => {
  it('retorna status 200 quando banco está disponível', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('up');
  });
});
