import { Request, Response, NextFunction } from 'express';
import { authMiddleware, authorizeRoles } from '../../src/middleware/authMiddleware';
import { createTestToken } from '../../../packages/test-utils/src/jwt/createTestToken';
import { createMockResponse } from '../../../packages/test-utils/src/mocks/express';

describe('freight authMiddleware', () => {
  it('retorna 401 sem Authorization header', () => {
    const req = { headers: {} } as Request;
    const res = createMockResponse();
    const next = jest.fn() as NextFunction;

    authMiddleware(req, res as unknown as Response, next);
    expect(res.statusCode).toBe(401);
  });

  it('autentica token COMPANY', () => {
    const token = createTestToken({ id: 5, role: 'COMPANY' });
    const req = { headers: { authorization: `Bearer ${token}` } } as Request;
    const res = createMockResponse();
    const next = jest.fn() as NextFunction;

    authMiddleware(req, res as unknown as Response, next);
    expect(req.user?.role).toBe('COMPANY');
    expect(next).toHaveBeenCalled();
  });
});

describe('freight authorizeRoles', () => {
  it('bloqueia USER em rota COMPANY', () => {
    const middleware = authorizeRoles('COMPANY');
    const req = { user: { id: 1, role: 'USER' } } as Request;
    const res = createMockResponse();
    const next = jest.fn() as NextFunction;

    middleware(req, res as unknown as Response, next);
    expect(res.statusCode).toBe(403);
  });
});
