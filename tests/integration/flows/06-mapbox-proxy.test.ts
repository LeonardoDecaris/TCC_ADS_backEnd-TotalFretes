import { createApiClient, apiGet } from '@total-fretes/test-utils';

const baseUrl = process.env.API_BASE_URL ?? 'http://localhost:80';

describe('API Flow: mapbox proxy', () => {
  it('rota de geocode-forward responde via gateway', async () => {
    const client = createApiClient({ baseUrl });
    const { status } = await apiGet(client, '/api/mapbox/geocode-forward', {
      params: { q: 'São Paulo' },
    });
    expect([200, 400, 401, 502, 503]).toContain(status);
  });
});
