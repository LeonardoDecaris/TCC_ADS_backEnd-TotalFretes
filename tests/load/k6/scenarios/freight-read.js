import { check, sleep } from 'k6';
import { loginAdmin } from '../lib/auth.js';
import { BASE_URL, tracedGet } from '../lib/http.js';
import { readThresholds } from '../config/thresholds.js';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '2m', target: 60 },
    { duration: '30s', target: 0 },
  ],
  thresholds: readThresholds,
};

const SCENARIO = 'freight-read';

export function setup() {
  const token = loginAdmin();
  if (!token) {
    throw new Error('Falha no setup: login admin não retornou token');
  }
  return { token };
}

export default function freightRead(data) {
  const response = tracedGet(`${BASE_URL}/api/freight`, {
    token: data.token,
    scenario: SCENARIO,
    endpoint: '/api/freight',
    tags: { name: 'freight_list' },
  });

  check(response, {
    'freight list status 200': (r) => r.status === 200,
  });

  sleep(0.5);
}
