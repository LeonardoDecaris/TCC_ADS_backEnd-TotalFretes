export const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:80';

export function defaultHeaders(token) {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}
