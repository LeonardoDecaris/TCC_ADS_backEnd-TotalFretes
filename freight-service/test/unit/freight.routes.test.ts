import {
  asAdmin,
  asCompany,
  asUser,
  unauthenticatedRequest,
} from '../../../packages/test-utils/src/http/authenticatedRequest';
import { createMockModelInstance } from '../../../packages/test-utils/src/mocks/sequelizeModel';
import { validFreightCreate } from '../../../packages/test-utils/src/fixtures/entities';

import app from '../../src/app';

const freightRow = createMockModelInstance({ id: 1, ...validFreightCreate });

import * as freightService from '../../src/services/freight.service';

describe('freight CRUD routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.values(freightService).forEach((value) => {
      if (typeof value === 'function' && 'mockReset' in value) {
        (value as jest.Mock).mockReset();
      }
    });
  });

  describe('POST /freight', () => {
    it('retorna 401 sem autenticação', async () => {
      const res = await unauthenticatedRequest(app).post('/freight').send(validFreightCreate);
      expect(res.status).toBe(401);
    });

    it('retorna 403 com role USER', async () => {
      const res = await asUser(app).post('/freight').send(validFreightCreate);
      expect(res.status).toBe(403);
    });

    it('retorna 400 com payload inválido', async () => {
      const res = await asCompany(app).post('/freight').send({ name: '' });
      expect(res.status).toBe(400);
    });

    it('retorna 201 com COMPANY e payload válido', async () => {
      (freightService.createFreightRecord as jest.Mock).mockResolvedValueOnce(freightRow);
      const res = await asCompany(app).post('/freight').send(validFreightCreate);
      expect(res.status).toBe(201);
    });
  });

  describe('GET /freight', () => {
    it('retorna 401 sem autenticação', async () => {
      const res = await unauthenticatedRequest(app).get('/freight');
      expect(res.status).toBe(401);
    });

    it('retorna 200 listando fretes', async () => {
      (freightService.listFreights as jest.Mock).mockResolvedValueOnce({
        items: [freightRow],
        total: 1,
        page: 1,
        limit: 20,
        hasMore: false,
      });
      const res = await asUser(app).get('/freight');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /freight/:id', () => {
    it('retorna 401 sem autenticação', async () => {
      const res = await unauthenticatedRequest(app).get('/freight/1');
      expect(res.status).toBe(401);
    });

    it('retorna 404 quando não encontrado', async () => {
      (freightService.getFreightByIdRecord as jest.Mock).mockResolvedValueOnce(null);
      const res = await asUser(app).get('/freight/999');
      expect(res.status).toBe(404);
    });

    it('retorna 200 quando encontrado', async () => {
      (freightService.getFreightByIdRecord as jest.Mock).mockResolvedValueOnce(freightRow);
      (freightService.assertCompanyCanViewFreight as jest.Mock).mockReturnValueOnce(undefined);
      const res = await asCompany(app).get('/freight/1');
      expect(res.status).toBe(200);
    });
  });

  describe('PUT /freight/:id', () => {
    it('retorna 401 sem autenticação', async () => {
      const res = await unauthenticatedRequest(app).put('/freight/1').send({ name: 'Novo' });
      expect(res.status).toBe(401);
    });

    it('retorna 404 quando não encontrado', async () => {
      const err = new freightService.FreightNotFoundError();
      (freightService.updateFreightRecord as jest.Mock).mockRejectedValueOnce(err);
      const res = await asCompany(app).put('/freight/999').send({ name: 'Novo' });
      expect(res.status).toBe(404);
    });

    it('retorna 200 ao atualizar', async () => {
      (freightService.updateFreightRecord as jest.Mock).mockResolvedValueOnce(freightRow);
      const res = await asCompany(app).put('/freight/1').send({ name: 'Frete Atualizado' });
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /freight/:id', () => {
    it('retorna 401 sem autenticação', async () => {
      const res = await unauthenticatedRequest(app).delete('/freight/1');
      expect(res.status).toBe(401);
    });

    it('retorna 403 com role USER', async () => {
      const res = await asUser(app).delete('/freight/1');
      expect(res.status).toBe(403);
    });

    it('retorna 404 quando não encontrado', async () => {
      const err = new freightService.FreightNotFoundError();
      (freightService.deleteFreightRecord as jest.Mock).mockRejectedValueOnce(err);
      const res = await asCompany(app).delete('/freight/999');
      expect(res.status).toBe(404);
    });

    it('retorna 200 ao remover', async () => {
      (freightService.deleteFreightRecord as jest.Mock).mockResolvedValueOnce(undefined);
      const res = await asCompany(app).delete('/freight/1');
      expect(res.status).toBe(200);
    });
  });
});
