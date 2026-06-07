import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { logger } from '../config/logger';
import { getActiveRequestId, REQUEST_ID_HEADER } from '../utils/correlation';
import { logError } from '../utils/logError';

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

function withRequestIdHeaders(options?: AxiosRequestConfig): AxiosRequestConfig {
  const requestId = getActiveRequestId();
  if (!requestId) return options ?? {};

  return {
    ...options,
    headers: {
      ...(options?.headers ?? {}),
      [REQUEST_ID_HEADER]: requestId,
    },
  };
}

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
    const requestOptions = withRequestIdHeaders(options);

    try {
      return await fn();
    } catch (error) {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        if (status !== undefined && silentStatuses.includes(status)) {
          logError(logger, 'Downstream request returned expected error status', error, {
            status,
            requestId: getActiveRequestId(),
            url: error.config?.url,
          });
          return fallback;
        }
      }

      logError(logger, 'Downstream request failed', error, {
        requestId: getActiveRequestId(),
      });
      throw error;
    }
  }

  return {
    get<T>(path: string, options?: RequestOptions<T>) {
      const requestOptions = withRequestIdHeaders(options);
      return request(() => instance.get<T>(path, requestOptions).then((r) => r.data), options);
    },
    post<T>(path: string, data?: unknown, options?: RequestOptions<T>) {
      const requestOptions = withRequestIdHeaders(options);
      return request(
        () => instance.post<T>(path, data, requestOptions).then((r) => r.data),
        options,
      );
    },
    put<T>(path: string, data?: unknown, options?: RequestOptions<T>) {
      const requestOptions = withRequestIdHeaders(options);
      return request(
        () => instance.put<T>(path, data, requestOptions).then((r) => r.data),
        options,
      );
    },
    patch<T>(path: string, data?: unknown, options?: RequestOptions<T>) {
      const requestOptions = withRequestIdHeaders(options);
      return request(
        () => instance.patch<T>(path, data, requestOptions).then((r) => r.data),
        options,
      );
    },
    delete<T>(path: string, options?: RequestOptions<T>) {
      const requestOptions = withRequestIdHeaders(options);
      return request(() => instance.delete<T>(path, requestOptions).then((r) => r.data), options);
    },
  };
}
