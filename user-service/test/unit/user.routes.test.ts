import {
  asAdmin,
  asCompany,
  asUser,
  unauthenticatedRequest,
} from '../../../packages/test-utils/src/http/authenticatedRequest';
import { createMockModelInstance } from '../../../packages/test-utils/src/mocks/sequelizeModel';
import { validUserCreate } from '../../../packages/test-utils/src/fixtures/entities';
import { userModel } from '../setup/mockModels';

jest.mock('../../src/services/service', () => ({
  createAccountHttp: jest.fn(),
  getUserImageHttp: jest.fn().mockResolvedValue(null),
  deleteAccountHttp: jest.fn(),
}));

import app from '../../src/app';

describe('user CRUD routes', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('POST /user', () => {
    it('retorna 400 com payload inválido', async () => {
      const res = await unauthenticatedRequest(app).post('/user').send({ name: '' });
      expect(res.status).toBe(400);
    });

    it('retorna 201 com payload válido', async () => {
      userModel.findOne.mockResolvedValueOnce(null);
      userModel.create.mockResolvedValueOnce(createMockModelInstance({ id: 1 }));
      const res = await unauthenticatedRequest(app).post('/user').send(validUserCreate);
      expect(res.status).toBe(201);
    });
  });

  describe('GET /user', () => {
    it('retorna 401 sem autenticação', async () => {
      const res = await unauthenticatedRequest(app).get('/user');
      expect(res.status).toBe(401);
    });

    it('retorna 403 com role USER', async () => {
      const res = await asUser(app).get('/user');
      expect(res.status).toBe(403);
    });

    it('retorna 200 com ADMIN', async () => {
      userModel.findAll.mockResolvedValueOnce([createMockModelInstance({ id: 1, name: 'Test' })]);
      const res = await asAdmin(app).get('/user');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /user/:id', () => {
    it('retorna 401 sem autenticação', async () => {
      const res = await unauthenticatedRequest(app).get('/user/1');
      expect(res.status).toBe(401);
    });

    it('retorna 403 quando não é owner nem COMPANY/ADMIN', async () => {
      const res = await asUser(app, 99).get('/user/1');
      expect(res.status).toBe(403);
    });

    it('retorna 404 quando não encontrado', async () => {
      userModel.findOne.mockResolvedValueOnce(null);
      const res = await asUser(app, 1).get('/user/1');
      expect(res.status).toBe(404);
    });

    it('retorna 200 quando owner consulta', async () => {
      userModel.findOne.mockResolvedValueOnce(createMockModelInstance({ id: 1, name: 'Test' }));
      const res = await asUser(app, 1).get('/user/1');
      expect(res.status).toBe(200);
    });

    it('retorna 200 quando COMPANY consulta', async () => {
      userModel.findOne.mockResolvedValueOnce(createMockModelInstance({ id: 1, name: 'Test' }));
      const res = await asCompany(app).get('/user/1');
      expect(res.status).toBe(200);
    });
  });

  describe('PATCH /user/:id', () => {
    it('retorna 401 sem autenticação', async () => {
      const res = await unauthenticatedRequest(app).patch('/user/1').send({ name: 'Novo' });
      expect(res.status).toBe(401);
    });

    it('retorna 403 quando não é owner', async () => {
      const res = await asUser(app, 99).patch('/user/1').send({ name: 'Novo' });
      expect(res.status).toBe(403);
    });

    it('retorna 404 quando não encontrado', async () => {
      userModel.findByPk.mockResolvedValueOnce(null);
      const res = await asUser(app, 1).patch('/user/1').send({ name: 'Novo' });
      expect(res.status).toBe(404);
    });

    it('retorna 200 ao atualizar como owner', async () => {
      userModel.findByPk.mockResolvedValueOnce(createMockModelInstance({ id: 1, name: 'Test' }));
      const res = await asUser(app, 1).patch('/user/1').send({ name: 'Novo Nome' });
      expect(res.status).toBe(200);
    });

    it('retorna 400 ao tentar atualizar CPF', async () => {
      const res = await asUser(app, 1).patch('/user/1').send({ cpf: '12345678901' });
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /user/:id', () => {
    it('retorna 401 sem autenticação', async () => {
      const res = await unauthenticatedRequest(app).delete('/user/1');
      expect(res.status).toBe(401);
    });

    it('retorna 403 quando não é owner', async () => {
      const res = await asUser(app, 99).delete('/user/1');
      expect(res.status).toBe(403);
    });

    it('retorna 404 quando não encontrado', async () => {
      userModel.findByPk.mockResolvedValueOnce(null);
      const res = await asUser(app, 1).delete('/user/1');
      expect(res.status).toBe(404);
    });

    it('retorna 200 ao remover como owner', async () => {
      userModel.findByPk.mockResolvedValueOnce(createMockModelInstance({ id: 1 }));
      const res = await asUser(app, 1).delete('/user/1');
      expect(res.status).toBe(200);
    });
  });
});
