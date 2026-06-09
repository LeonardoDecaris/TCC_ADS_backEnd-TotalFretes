import { Request, Response, NextFunction } from 'express';
import { internalServiceMiddleware } from '../../src/middleware/internalServiceMiddleware';
import { createMockResponse } from '../../../packages/test-utils/src/mocks/express';

describe('internalServiceMiddleware', () => {
  beforeEach(() => {
    process.env.INTERNAL_SERVICE_KEY = 'test-internal-service-key';
  });

  it('retorna 403 sem x-service-key', async () => {
    const req = { headers: {}, query: {} } as Request;
    const res = createMockResponse();
    const next = jest.fn() as NextFunction;

    void internalServiceMiddleware(req, res as unknown as Response, next);
    await new Promise((resolve) => setImmediate(resolve));

    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('permite requisição com chave válida', () => {
    const req = { headers: { 'x-service-key': 'test-internal-service-key' }, query: {} } as unknown as Request;
    const res = createMockResponse();
    const next = jest.fn() as NextFunction;

    internalServiceMiddleware(req, res as unknown as Response, next);
    expect(next).toHaveBeenCalled();
  });
});
