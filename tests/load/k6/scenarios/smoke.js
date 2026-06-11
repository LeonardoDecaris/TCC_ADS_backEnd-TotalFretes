import { check, sleep } from 'k6';
import { BASE_URL, tracedGet } from '../lib/http.js';
import { smokeThresholds } from '../config/thresholds.js';

export const options = {
  vus: 2,
  duration: '30s',
  thresholds: smokeThresholds,
};

const SCENARIO = 'smoke';

const endpoints = [
  '/api/auth/health',
  '/api/email/health',
  '/storage',
];

export default function smoke() {
  for (const path of endpoints) {
    const response = tracedGet(`${BASE_URL}${path}`, {
      scenario: SCENARIO,
      endpoint: path,
      tags: { name: `smoke_${path}` },
    });

    check(response, {
      [`${path} status 200`]: (r) => r.status === 200,
    });
  }
  sleep(1);
}
