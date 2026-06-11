import {
  asAdmin,
  asUser,
  unauthenticatedRequest,
} from '../../../packages/test-utils/src/http/authenticatedRequest';
import { createMockModelInstance } from '../../../packages/test-utils/src/mocks/sequelizeModel';
import {
  validAccountCreate,
  validAccountAdminCreate,
  validAccountPatch,
} from '../../../packages/test-utils/src/fixtures/entities';
import { accountModel, accountTypeModel } from '../setup/mockModels';

jest.mock('../../src/services/accountCreation.service', () => ({
  createAccountRecord: jest.fn(),
  createAdminAccountRecord: jest.fn(),
  serializeAccountPublic: jest.fn((account: unknown) => account),
}));

import app from '../../src/app';
import {
  createAccountRecord,
  createAdminAccountRecord,
} from '../../src/services/accountCreation.service';

describe('account CRUD routes', () => {
  beforeEach(() => {
    accountModel.findByPk.mockReset();
    accountModel.findAll.mockReset();
    accountModel.findOne.mockReset();
    accountModel.findAndCountAll.mockReset();
    accountTypeModel.findAll.mockReset();
  });

  describe('POST /account', () => {
    it('retorna 400 com payload inválido', async () => {
      const res = await unauthenticatedRequest(app).post('/account').send({ email: 'x' });
      expect(res.status).toBe(400);
    });

    it('retorna 201 com payload válido', async () => {
      (createAccountRecord as jest.Mock).mockResolvedValueOnce({ ok: true });
      const res = await unauthenticatedRequest(app).post('/account').send(validAccountCreate);
      expect(res.status).toBe(201);
    });
  });

  describe('POST /account/admin', () => {
    it('retorna 401 sem autenticação', async () => {
      const res = await unauthenticatedRequest(app).post('/account/admin').send(validAccountAdminCreate);
      expect(res.status).toBe(401);
    });

    it('retorna 403 com role USER', async () => {
      const res = await asUser(app).post('/account/admin').send(validAccountAdminCreate);
      expect(res.status).toBe(403);
    });

    it('retorna 400 com payload inválido', async () => {
      const res = await asAdmin(app).post('/account/admin').send({ email: 'bad' });
      expect(res.status).toBe(400);
    });

    it('retorna 201 com ADMIN e payload válido', async () => {
      (createAdminAccountRecord as jest.Mock).mockResolvedValueOnce({
        ok: true,
        account: { id: 1, email: validAccountAdminCreate.email },
      });
      const res = await asAdmin(app).post('/account/admin').send(validAccountAdminCreate);
      expect(res.status).toBe(201);
    });
  });

  describe('GET /account/types', () => {
    it('retorna 200 listando tipos', async () => {
      accountTypeModel.findAll.mockResolvedValueOnce([{ id: 1, name: 'USER' }]);
      const res = await unauthenticatedRequest(app).get('/account/types');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /account', () => {
    it('retorna 401 sem autenticação', async () => {
      const res = await unauthenticatedRequest(app).get('/account');
      expect(res.status).toBe(401);
    });

    it('retorna 403 com role USER', async () => {
      const res = await asUser(app).get('/account');
      expect(res.status).toBe(403);
    });

    it('retorna 200 com ADMIN', async () => {
      const row = createMockModelInstance({ id: 1, email: 'a@test.com' });
      accountModel.findAndCountAll.mockResolvedValueOnce({ rows: [row], count: 1 });
      const res = await asAdmin(app).get('/account');
      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(1);
    });
  });

  describe('GET /account/:id', () => {
    it('retorna 401 sem autenticação', async () => {
      const res = await unauthenticatedRequest(app).get('/account/1');
      expect(res.status).toBe(401);
    });

    it('retorna 404 quando não encontrado', async () => {
      accountModel.findByPk.mockResolvedValueOnce(null);
      const res = await asAdmin(app).get('/account/999');
      expect(res.status).toBe(404);
    });

    it('retorna 200 quando encontrado', async () => {
      const row = createMockModelInstance({ id: 1, email: 'a@test.com' });
      accountModel.findByPk.mockResolvedValueOnce(row);
      const res = await asAdmin(app).get('/account/1');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /account/subject/:subjectId', () => {
    it('retorna 401 sem autenticação', async () => {
      const res = await unauthenticatedRequest(app).get('/account/subject/10');
      expect(res.status).toBe(401);
    });

    it('retorna 403 com role USER', async () => {
      const res = await asUser(app).get('/account/subject/10');
      expect(res.status).toBe(403);
    });

    it('retorna 404 quando não encontrado', async () => {
      accountModel.findOne.mockResolvedValueOnce(null);
      const res = await asAdmin(app).get('/account/subject/999');
      expect(res.status).toBe(404);
    });

    it('retorna 200 quando encontrado', async () => {
      const row = createMockModelInstance({ id: 1, subject_id: 10 });
      accountModel.findOne.mockResolvedValueOnce(row);
      const res = await asAdmin(app).get('/account/subject/10');
      expect(res.status).toBe(200);
    });
  });

  describe('PATCH /account/:id', () => {
    it('retorna 401 sem autenticação', async () => {
      const res = await unauthenticatedRequest(app).patch('/account/1').send(validAccountPatch);
      expect(res.status).toBe(401);
    });

    it('retorna 403 com role USER', async () => {
      const res = await asUser(app).patch('/account/1').send(validAccountPatch);
      expect(res.status).toBe(403);
    });

    it('retorna 404 quando não encontrado', async () => {
      accountModel.findByPk.mockResolvedValueOnce(null);
      const res = await asAdmin(app).patch('/account/999').send(validAccountPatch);
      expect(res.status).toBe(404);
    });

    it('retorna 400 com payload inválido', async () => {
      const row = createMockModelInstance({ id: 1, email: 'a@test.com' });
      accountModel.findByPk.mockResolvedValueOnce(row);
      const res = await asAdmin(app).patch('/account/1').send({});
      expect(res.status).toBe(400);
    });

    it('retorna 200 ao atualizar', async () => {
      const row = createMockModelInstance({ id: 1, email: 'a@test.com' });
      accountModel.findByPk
        .mockResolvedValueOnce(row)
        .mockResolvedValueOnce(row);
      accountModel.findOne.mockResolvedValueOnce(null);
      const res = await asAdmin(app).patch('/account/1').send(validAccountPatch);
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /account/:id', () => {
    it('retorna 401 sem autenticação', async () => {
      const res = await unauthenticatedRequest(app).delete('/account/1');
      expect(res.status).toBe(401);
    });

    it('retorna 403 com role USER', async () => {
      const res = await asUser(app).delete('/account/1');
      expect(res.status).toBe(403);
    });

    it('retorna 404 quando não encontrado', async () => {
      accountModel.findByPk.mockResolvedValueOnce(null);
      const res = await asAdmin(app).delete('/account/999');
      expect(res.status).toBe(404);
    });

    it('retorna 200 ao remover', async () => {
      const row = createMockModelInstance({ id: 1 });
      accountModel.findByPk.mockResolvedValueOnce(row);
      const res = await asAdmin(app).delete('/account/1');
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /account/subject/:id', () => {
    it('retorna 401 sem autenticação', async () => {
      const res = await unauthenticatedRequest(app).delete('/account/subject/1');
      expect(res.status).toBe(401);
    });

    it('retorna 403 quando não é o owner', async () => {
      const res = await asUser(app, 99).delete('/account/subject/1');
      expect(res.status).toBe(403);
    });

    it('retorna 404 quando não encontrado', async () => {
      accountModel.findOne.mockResolvedValueOnce(null);
      const res = await asUser(app, 1).delete('/account/subject/1');
      expect(res.status).toBe(404);
    });

    it('retorna 200 quando owner remove', async () => {
      const row = createMockModelInstance({ id: 1, subject_id: 1 });
      accountModel.findOne.mockResolvedValueOnce(row);
      const res = await asUser(app, 1).delete('/account/subject/1');
      expect(res.status).toBe(200);
    });
  });
});
