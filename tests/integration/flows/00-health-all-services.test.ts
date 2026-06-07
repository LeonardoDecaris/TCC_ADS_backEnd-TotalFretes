import { createApiClient, apiGet } from '@total-fretes/test-utils';

const baseUrl = process.env.API_BASE_URL ?? 'http://localhost:80';

describe('API Flow: health via Nginx', () => {
  const client = createApiClient({ baseUrl });

  const gatewayHealthEndpoints = [
      { path: '/api/auth/health', name: 'authentication-service', allowedStatuses: [200, 503] },
    { path: '/api/email/health', name: 'email-management-service', allowedStatuses: [200] },
    { path: '/storage', name: 'storage-service', allowedStatuses: [200] },
  ];

  it.each(gatewayHealthEndpoints)(
    '$name responde via gateway em $path',
    async ({ path, allowedStatuses }) => {
      const { status } = await apiGet(client, path);
      expect(allowedStatuses).toContain(status);
    },
  );
});
