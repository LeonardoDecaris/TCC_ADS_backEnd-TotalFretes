import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL } from '../lib/http.js';
import { smokeThresholds } from '../config/thresholds.js';

export const options = {
  vus: 2,
  duration: '30s',
  thresholds: smokeThresholds,
};

const endpoints = [
  '/api/auth/health',
  '/api/email/health',
  '/storage',
];

export default function smoke() {
  for (const path of endpoints) {
    const response = http.get(`${BASE_URL}${path}`, { tags: { name: `smoke_${path}` } });
    check(response, {
      [`${path} status 200`]: (r) => r.status === 200,
    });
  }
  sleep(1);
}
