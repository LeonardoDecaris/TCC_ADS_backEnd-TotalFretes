import { createApiClient, apiPost, TEST_ADMIN } from '@total-fretes/test-utils';

export type LoginResult = {
  token: string;
  userId?: number;
  role?: string;
};

export async function loginAsAdmin(baseUrl?: string): Promise<LoginResult> {
  const client = createApiClient({ baseUrl });
  const { status, data } = await apiPost<{ token?: string; accessToken?: string; id?: number; role?: string }>(
    client,
    '/api/auth/login',
    {
      email: TEST_ADMIN.email,
      password: TEST_ADMIN.password,
    },
  );

  if (status !== 200) {
    throw new Error(`Login admin falhou com status ${status}: ${JSON.stringify(data)}`);
  }

  const token = data.token ?? data.accessToken;
  if (!token) {
    throw new Error('Login admin não retornou token');
  }

  return { token, userId: data.id, role: data.role };
}

export function authClient(token: string, baseUrl?: string) {
  return createApiClient({ baseUrl, token });
}
