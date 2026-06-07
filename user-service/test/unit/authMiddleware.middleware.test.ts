import { Request, Response, NextFunction } from 'express';
import { authMiddleware, authorizeRoles } from '../../src/middlewares/authMiddleware';
import { createTestToken } from '../../../packages/test-utils/src/jwt/createTestToken';
import { createMockResponse } from '../../../packages/test-utils/src/mocks/express';

describe('authMiddleware', () => {
  it('retorna 401 quando token não é enviado', () => {
    const req = { headers: {} } as Request;
    const res = createMockResponse();
    const next = jest.fn() as NextFunction;

    authMiddleware(req, res as unknown as Response, next);

    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('popula req.user com token válido', () => {
    const token = createTestToken({ id: 10, role: 'USER' });
    const req = { headers: { authorization: `Bearer ${token}` } } as Request;
    const res = createMockResponse();
    const next = jest.fn() as NextFunction;

    authMiddleware(req, res as unknown as Response, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ id: 10, role: 'USER' });
  });
});

describe('authorizeRoles', () => {
  it('permite ADMIN independente do role exigido', () => {
    const middleware = authorizeRoles('COMPANY');
    const req = { user: { id: 1, role: 'ADMIN' } } as Request;
    const res = createMockResponse();
    const next = jest.fn() as NextFunction;

    middleware(req, res as unknown as Response, next);
    expect(next).toHaveBeenCalled();
  });

  it('nega role não autorizado', () => {
    const middleware = authorizeRoles('COMPANY');
    const req = { user: { id: 2, role: 'USER' } } as Request;
    const res = createMockResponse();
    const next = jest.fn() as NextFunction;

    middleware(req, res as unknown as Response, next);
    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });
});
