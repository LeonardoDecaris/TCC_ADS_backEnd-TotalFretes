import axios from 'axios';

export type HealthEndpoint = {
  name: string;
  path: string;
  expectedStatus?: number;
};

export type WaitForHealthyOptions = {
  baseUrl: string;
  endpoints: HealthEndpoint[];
  timeoutMs?: number;
  intervalMs?: number;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitForHealthy(options: WaitForHealthyOptions): Promise<void> {
  const timeoutMs = options.timeoutMs ?? 180_000;
  const intervalMs = options.intervalMs ?? 3_000;
  const baseUrl = options.baseUrl.replace(/\/$/, '');
  const deadline = Date.now() + timeoutMs;
  const pending = new Set(options.endpoints.map((e) => e.name));

  while (Date.now() < deadline) {
    for (const endpoint of options.endpoints) {
      if (!pending.has(endpoint.name)) continue;

      try {
        const response = await axios.get(`${baseUrl}${endpoint.path}`, {
          timeout: 5_000,
          validateStatus: () => true,
        });
        const expected = endpoint.expectedStatus ?? 200;
        if (response.status === expected) {
          pending.delete(endpoint.name);
        }
      } catch {
        // retry
      }
    }

    if (pending.size === 0) return;
    await sleep(intervalMs);
  }

  throw new Error(
    `Timeout aguardando health checks: ${Array.from(pending).join(', ')}`,
  );
}
