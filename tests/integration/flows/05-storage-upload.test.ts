import { createApiClient, apiGet } from '@total-fretes/test-utils';

const baseUrl = process.env.API_BASE_URL ?? 'http://localhost:80';

describe('API Flow: storage', () => {
  it('storage responde via gateway (/storage evita //health no proxy Nginx)', async () => {
    const client = createApiClient({ baseUrl });
    const { status } = await apiGet(client, '/storage');
    expect(status).toBe(200);
  });
});
