import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

const errorStatuses = [400, 401, 403, 404, 409, 500];

export type HttpClientOptions = {
  baseURL: string;
};

export type RequestOptions<T = unknown> = {
  fallback?: T;
  silentStatuses?: number[];
} & AxiosRequestConfig;

export type HttpClient = {
  get<T>(path: string, options?: RequestOptions<T>): Promise<T>;
  post<T>(path: string, data?: unknown, options?: RequestOptions<T>): Promise<T>;
  put<T>(path: string, data?: unknown, options?: RequestOptions<T>): Promise<T>;
  patch<T>(path: string, data?: unknown, options?: RequestOptions<T>): Promise<T>;
  delete<T>(path: string, options?: RequestOptions<T>): Promise<T>;
};

export function createHttpClient(clientOptions: HttpClientOptions): HttpClient {
  const instance: AxiosInstance = axios.create({
    baseURL: clientOptions.baseURL,
    timeout: 3000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  async function request<T>(fn: () => Promise<T>, options?: RequestOptions<T>): Promise<T> {
    const silentStatuses = options?.silentStatuses ?? errorStatuses;
    const fallback = (options?.fallback ?? null) as T;

    try {
      return await fn();
    } catch (error) {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        if (status !== undefined && silentStatuses.includes(status)) {
          return fallback;
        }
      }
      throw error;
    }
  }

  return {
    get<T>(path: string, options?: RequestOptions<T>) {
      return request(() => instance.get<T>(path, options).then((r) => r.data), options);
    },
    post<T>(path: string, data?: unknown, options?: RequestOptions<T>) {
      return request(() => instance.post<T>(path, data, options).then((r) => r.data), options);
    },
    put<T>(path: string, data?: unknown, options?: RequestOptions<T>) {
      return request(() => instance.put<T>(path, data, options).then((r) => r.data), options);
    },
    patch<T>(path: string, data?: unknown, options?: RequestOptions<T>) {
      return request(() => instance.patch<T>(path, data, options).then((r) => r.data), options);
    },
    delete<T>(path: string, options?: RequestOptions<T>) {
      return request(() => instance.delete<T>(path, options).then((r) => r.data), options);
    },
  };
}