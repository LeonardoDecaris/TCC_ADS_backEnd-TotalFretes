import request from 'supertest';
import app from '../../src/app';

describe('GET /', () => {
  it('retorna mensagem de serviço ativo', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Authentication Service');
  });
});

describe('GET /api-docs', () => {
  it('retorna documentação OpenAPI', async () => {
    const response = await request(app).get('/api-docs');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('paths');
  });
});
