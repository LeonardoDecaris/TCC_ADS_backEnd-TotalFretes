import { check, sleep } from 'k6';
import { BASE_URL, tracedPost } from '../lib/http.js';
import { authThresholds } from '../config/thresholds.js';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 30 },
    { duration: '30s', target: 0 },
  ],
  thresholds: authThresholds,
};

const SCENARIO = 'auth-login';
const ADMIN_EMAIL = __ENV.ADMIN_EMAIL || 'admin@totalfretes.com.br';
const ADMIN_PASSWORD = __ENV.ADMIN_PASSWORD || 'Admin@123456';

export default function authLogin() {
  const response = tracedPost(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    {
      scenario: SCENARIO,
      endpoint: '/api/auth/login',
      tags: { name: 'auth_login' },
    },
  );

  check(response, {
    'login status 200': (r) => r.status === 200,
    'login possui token': (r) => {
      try {
        return Boolean(r.json('token'));
      } catch {
        return false;
      }
    },
  });

  sleep(1);
}
