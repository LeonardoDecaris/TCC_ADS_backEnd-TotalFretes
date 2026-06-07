import { apiGet } from '@total-fretes/test-utils';
import { loginAsAdmin, authClient } from '../helpers/auth';

const baseUrl = process.env.API_BASE_URL ?? 'http://localhost:80';

describe('API Flow: empresa e endereço', () => {
  it('lista empresas com autenticação admin', async () => {
    const { token } = await loginAsAdmin(baseUrl);
    const client = authClient(token, baseUrl);
    const { status, data } = await apiGet<unknown>(client, '/api/company');
    expect(status).toBe(200);
    expect(data).toBeDefined();
  });
});
