import {
  asAdmin,
  asUser,
  unauthenticatedRequest,
} from '../../../packages/test-utils/src/http/authenticatedRequest';
import { createMockModelInstance } from '../../../packages/test-utils/src/mocks/sequelizeModel';
import { validVehicleCreate } from '../../../packages/test-utils/src/fixtures/entities';
import { vehicleModel } from '../setup/mockModels';

import app from '../../src/app';

describe('vehicle CRUD routes', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('POST /vehicle', () => {
    it('retorna 401 sem autenticação', async () => {
      const res = await unauthenticatedRequest(app).post('/vehicle').send(validVehicleCreate);
      expect(res.status).toBe(401);
    });

    it('retorna 400 com payload inválido', async () => {
      const res = await asUser(app).post('/vehicle').send({ plateNumber: '' });
      expect(res.status).toBe(400);
    });

    it('retorna 201 com payload válido', async () => {
      vehicleModel.create.mockResolvedValueOnce(createMockModelInstance({ id: 1 }));
      const res = await asUser(app).post('/vehicle').send(validVehicleCreate);
      expect(res.status).toBe(201);
    });
  });

  describe('GET /vehicle', () => {
    it('retorna 401 sem autenticação', async () => {
      const res = await unauthenticatedRequest(app).get('/vehicle');
      expect(res.status).toBe(401);
    });

    it('retorna 403 com role USER', async () => {
      const res = await asUser(app).get('/vehicle');
      expect(res.status).toBe(403);
    });

    it('retorna 200 com ADMIN', async () => {
      vehicleModel.findAll.mockResolvedValueOnce([createMockModelInstance({ id: 1 })]);
      const res = await asAdmin(app).get('/vehicle');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /vehicle/:id', () => {
    it('retorna 401 sem autenticação', async () => {
      const res = await unauthenticatedRequest(app).get('/vehicle/1');
      expect(res.status).toBe(401);
    });

    it('retorna 404 quando não encontrado', async () => {
      vehicleModel.findByPk.mockResolvedValueOnce(null);
      const res = await asUser(app).get('/vehicle/999');
      expect(res.status).toBe(404);
    });

    it('retorna 200 quando encontrado', async () => {
      vehicleModel.findByPk.mockResolvedValueOnce(createMockModelInstance({ id: 1 }));
      const res = await asUser(app).get('/vehicle/1');
      expect(res.status).toBe(200);
    });
  });

  describe('PUT /vehicle/:id', () => {
    it('retorna 401 sem autenticação', async () => {
      const res = await unauthenticatedRequest(app).put('/vehicle/1').send({ city: 'Campinas' });
      expect(res.status).toBe(401);
    });

    it('retorna 404 quando não encontrado', async () => {
      vehicleModel.findByPk.mockResolvedValueOnce(null);
      const res = await asUser(app).put('/vehicle/999').send({ city: 'Campinas' });
      expect(res.status).toBe(404);
    });

    it('retorna 200 ao atualizar', async () => {
      vehicleModel.findByPk.mockResolvedValueOnce(createMockModelInstance({ id: 1 }));
      const res = await asUser(app).put('/vehicle/1').send({ city: 'Campinas' });
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /vehicle/:id', () => {
    it('retorna 401 sem autenticação', async () => {
      const res = await unauthenticatedRequest(app).delete('/vehicle/1');
      expect(res.status).toBe(401);
    });

    it('retorna 404 quando não encontrado', async () => {
      vehicleModel.findByPk.mockResolvedValueOnce(null);
      const res = await asUser(app).delete('/vehicle/999');
      expect(res.status).toBe(404);
    });

    it('retorna 200 ao remover', async () => {
      vehicleModel.findByPk.mockResolvedValueOnce(createMockModelInstance({ id: 1 }));
      const res = await asUser(app).delete('/vehicle/1');
      expect(res.status).toBe(200);
    });
  });
});
