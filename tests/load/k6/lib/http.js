import http from 'k6/http';

export const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:80';

export function defaultHeaders(token, extraHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...extraHeaders,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export function buildTags(scenario, endpoint, extraTags = {}) {
  return {
    scenario,
    endpoint,
    ...extraTags,
  };
}

export function tracedGet(url, { token, scenario, endpoint, tags = {} } = {}) {
  return http.get(url, {
    headers: defaultHeaders(token),
    tags: buildTags(scenario, endpoint, tags),
  });
}

export function tracedPost(url, body, { token, scenario, endpoint, tags = {} } = {}) {
  return http.post(url, body, {
    headers: defaultHeaders(token),
    tags: buildTags(scenario, endpoint, tags),
  });
}
