import request, { type Test } from 'supertest';

export type TestableApp = Parameters<typeof request>[0];
import { createTestToken, type TestJwtRole } from '../jwt/createTestToken';

export type AuthRequestOptions = {
  role?: TestJwtRole;
  id?: number;
};

function withAuth(test: Test, options: AuthRequestOptions = {}): Test {
  const token = createTestToken({
    role: options.role ?? 'ADMIN',
    id: options.id ?? 1,
  });
  return test.set('Authorization', `Bearer ${token}`);
}

export function authenticatedRequest(app: TestableApp, options: AuthRequestOptions = {}) {
  return {
    get: (path: string) => withAuth(request(app).get(path), options),
    post: (path: string) => withAuth(request(app).post(path), options),
    put: (path: string) => withAuth(request(app).put(path), options),
    patch: (path: string) => withAuth(request(app).patch(path), options),
    delete: (path: string) => withAuth(request(app).delete(path), options),
  };
}

export function asAdmin(app: TestableApp, id = 1) {
  return authenticatedRequest(app, { role: 'ADMIN', id });
}

export function asCompany(app: TestableApp, id = 1) {
  return authenticatedRequest(app, { role: 'COMPANY', id });
}

export function asUser(app: TestableApp, id = 1) {
  return authenticatedRequest(app, { role: 'USER', id });
}

export function unauthenticatedRequest(app: TestableApp) {
  return request(app);
}
