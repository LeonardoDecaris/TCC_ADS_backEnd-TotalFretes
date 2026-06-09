import http from 'k6/http';
import { check, sleep } from 'k6';
import { loginAdmin } from '../lib/auth.js';
import { BASE_URL, defaultHeaders } from '../lib/http.js';
import { readThresholds } from '../config/thresholds.js';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '2m', target: 60 },
    { duration: '30s', target: 0 },
  ],
  thresholds: readThresholds,
};

export function setup() {
  const token = loginAdmin();
  if (!token) {
    throw new Error('Falha no setup: login admin não retornou token');
  }
  return { token };
}

export default function freightRead(data) {
  const response = http.get(`${BASE_URL}/api/freight`, {
    headers: defaultHeaders(data.token),
    tags: { name: 'freight_list' },
  });

  check(response, {
    'freight list status 200': (r) => r.status === 200,
  });

  sleep(0.5);
}
