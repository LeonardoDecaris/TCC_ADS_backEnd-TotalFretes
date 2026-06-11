import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export type ApiClientOptions = {
  baseUrl?: string;
  token?: string;
  timeoutMs?: number;
};

export function createApiClient(options: ApiClientOptions = {}): AxiosInstance {
  const baseURL = (options.baseUrl ?? process.env.API_BASE_URL ?? 'http://localhost:80').replace(
    /\/$/,
    '',
  );

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  return axios.create({
    baseURL,
    timeout: options.timeoutMs ?? 15_000,
    headers,
    validateStatus: () => true,
  });
}

export async function apiGet<T = unknown>(
  client: AxiosInstance,
  path: string,
  config?: AxiosRequestConfig,
): Promise<{ status: number; data: T }> {
  const response = await client.get<T>(path, config);
  return { status: response.status, data: response.data };
}

export async function apiPost<T = unknown>(
  client: AxiosInstance,
  path: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<{ status: number; data: T }> {
  const response = await client.post<T>(path, body, config);
  return { status: response.status, data: response.data };
}
