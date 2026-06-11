import { waitForHealthy } from '@total-fretes/test-utils';

const SKIP_STACK_WAIT = process.env.SKIP_STACK_WAIT === 'true';

export default async function globalSetup(): Promise<void> {
  if (SKIP_STACK_WAIT) {
    console.log('[integration] SKIP_STACK_WAIT=true — pulando wait do stack');
    return;
  }

  const baseUrl = process.env.API_BASE_URL ?? 'http://localhost:80';

  await waitForHealthy({
    baseUrl,
    timeoutMs: 240_000,
    intervalMs: 5_000,
    endpoints: [
      { name: 'nginx-auth-health', path: '/api/auth/health', expectedStatus: 200 },
      { name: 'nginx-email-health', path: '/api/email/health' },
      { name: 'nginx-storage-health', path: '/storage' },
    ],
  });

  console.log('[integration] Stack pronto para testes');
}
