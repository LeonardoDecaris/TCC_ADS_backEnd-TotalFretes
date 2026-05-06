import axios from 'axios';

const ACCOUNT_CREATE_TIMEOUT_MS = 15_000;

export type CreateAccountPayload = {
  email: string;
  password: string;
  subject_id: number;
  account_type_id: number;
};

/** true se a conta foi criada no authentication-service (HTTP 201 e ok: true). */
export async function createAccountHttp(
  payload: CreateAccountPayload,
): Promise<boolean> {
  const base = (process.env.AUTH_SERVICE_URL ?? '').replace(/\/$/, '');
  if (!base) {
    console.error('[account.http] AUTH_SERVICE_URL is not defined');
    return false;
  }

  try {
    const res = await axios.post<{ ok?: boolean }>(
      `${base}/account`,
      payload,
      {
        timeout: ACCOUNT_CREATE_TIMEOUT_MS,
        validateStatus: () => true,
        headers: { 'Content-Type': 'application/json' },
      },
    );

    return res.status === 201 && res.data?.ok === true;
  } catch (err) {
    console.error('[account.http] request failed:', err);
    return false;
  }
}
