import { createApiClient, apiGet } from '@total-fretes/test-utils';

const baseUrl = process.env.API_BASE_URL ?? 'http://localhost:80';

describe('API Flow: email management', () => {
  it('health do serviço de email via gateway', async () => {
    const client = createApiClient({ baseUrl });
    const { status, data } = await apiGet<string>(client, '/api/email/health');
    expect(status).toBe(200);
    expect(data).toBe('OK');
  });
});
