import request from 'supertest';
import app from '../../src/app';

describe('GET /health', () => {
  it('retorna status 200', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
  });
});
