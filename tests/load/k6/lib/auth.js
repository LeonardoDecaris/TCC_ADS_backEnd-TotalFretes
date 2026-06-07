import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL, defaultHeaders } from './http.js';

const ADMIN_EMAIL = __ENV.ADMIN_EMAIL || 'admin@totalfretes.com.br';
const ADMIN_PASSWORD = __ENV.ADMIN_PASSWORD || 'Admin@123456';

export function loginAdmin() {
  const response = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    { headers: defaultHeaders() },
  );

  check(response, {
    'login status 200': (r) => r.status === 200,
    'login retorna token': (r) => {
      try {
        const body = r.json();
        return Boolean(body && body.token);
      } catch {
        return false;
      }
    },
  });

  if (response.status !== 200) {
    return null;
  }

  return response.json('token');
}
