import http from 'k6/http';
import { check, sleep } from 'k6';
import { loginAdmin } from '../lib/auth.js';
import { BASE_URL, defaultHeaders } from '../lib/http.js';
import { writeThresholds } from '../config/thresholds.js';

export const options = {
  stages: [
    { duration: '20s', target: 5 },
    { duration: '1m', target: 15 },
    { duration: '20s', target: 0 },
  ],
  thresholds: writeThresholds,
};

export function setup() {
  const token = loginAdmin();
  if (!token) {
    throw new Error('Falha no setup: login admin não retornou token');
  }
  return { token };
}

export default function freightWrite(data) {
  const listResponse = http.get(`${BASE_URL}/api/cargo-type`, {
    headers: defaultHeaders(data.token),
    tags: { name: 'cargo_type_list' },
  });

  check(listResponse, {
    'cargo types status 200': (r) => r.status === 200,
  });

  sleep(1);
}
