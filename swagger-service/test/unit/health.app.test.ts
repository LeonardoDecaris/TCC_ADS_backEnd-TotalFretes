import request from 'supertest';
import app from '../../src/app';

describe('GET /health', () => {
  it('retorna ok', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.text).toBe('ok');
  });
});
