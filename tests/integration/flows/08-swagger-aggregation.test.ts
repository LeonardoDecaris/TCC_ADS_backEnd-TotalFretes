import { createApiClient, apiGet } from '@total-fretes/test-utils';

const baseUrl = process.env.API_BASE_URL ?? 'http://localhost:80';

describe('API Flow: swagger aggregation', () => {
  const client = createApiClient({ baseUrl });

  it('health do swagger-service responde via gateway', async () => {
    const { status, data } = await apiGet<string>(client, '/api-docs/health');
    expect(status).toBe(200);
    expect(data).toBe('ok');
  });

  it('endpoint /docs retorna JSON OpenAPI via gateway', async () => {
    const { status, data } = await apiGet<Record<string, unknown>>(client, '/docs');
    expect(status).toBe(200);
    expect(data).toHaveProperty('openapi');
    expect(data).toHaveProperty('paths');
  });
});
