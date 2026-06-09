import { createApiClient, apiGet, apiPost, TEST_ADMIN } from '@total-fretes/test-utils';
import { loginAsAdmin, authClient } from '../helpers/auth';

const baseUrl = process.env.API_BASE_URL ?? 'http://localhost:80';

describe('API Flow: autenticação e conta', () => {
  it('login com credenciais de admin seed retorna token', async () => {
    const result = await loginAsAdmin(baseUrl);
    expect(result.token).toBeTruthy();
    expect(typeof result.token).toBe('string');
  });

  it('rota protegida verify-token aceita token válido', async () => {
    const { token } = await loginAsAdmin(baseUrl);
    const client = authClient(token, baseUrl);
    const { status } = await apiGet(client, '/api/auth/verify-token');
    expect(status).toBe(200);
  });

  it('login com senha inválida retorna erro', async () => {
    const client = createApiClient({ baseUrl });
    const { status } = await apiPost(client, '/api/auth/login', {
      email: TEST_ADMIN.email,
      password: 'senha-errada',
    });
    expect(status).toBeGreaterThanOrEqual(400);
  });
});
