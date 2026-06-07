import { apiGet } from '@total-fretes/test-utils';
import { loginAsAdmin, authClient } from '../helpers/auth';

const baseUrl = process.env.API_BASE_URL ?? 'http://localhost:80';

describe('API Flow: fretes e propostas', () => {
  it('lista fretes autenticado', async () => {
    const { token } = await loginAsAdmin(baseUrl);
    const client = authClient(token, baseUrl);
    const { status, data } = await apiGet<unknown>(client, '/api/freight');
    expect(status).toBe(200);
    expect(data).toBeDefined();
  });

  it('lista tipos de carga', async () => {
    const { token } = await loginAsAdmin(baseUrl);
    const client = authClient(token, baseUrl);
    const { status } = await apiGet(client, '/api/cargo-type');
    expect(status).toBe(200);
  });

  it('lista status de frete', async () => {
    const { token } = await loginAsAdmin(baseUrl);
    const client = authClient(token, baseUrl);
    const { status } = await apiGet(client, '/api/freight-status-type');
    expect(status).toBe(200);
  });
});
