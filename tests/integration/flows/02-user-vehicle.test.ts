import { apiGet } from '@total-fretes/test-utils';
import { loginAsAdmin, authClient } from '../helpers/auth';

const baseUrl = process.env.API_BASE_URL ?? 'http://localhost:80';

describe('API Flow: usuário e veículos', () => {
  it('lista tipos de veículo com token admin', async () => {
    const { token } = await loginAsAdmin(baseUrl);
    const client = authClient(token, baseUrl);
    const { status, data } = await apiGet<unknown[]>(client, '/api/vehicle-type');
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  it('lista grupos de tipo de veículo', async () => {
    const { token } = await loginAsAdmin(baseUrl);
    const client = authClient(token, baseUrl);
    const { status } = await apiGet(client, '/api/group-vehicle-type');
    expect(status).toBe(200);
  });
});
