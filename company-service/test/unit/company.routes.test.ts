import {
  asAdmin,
  asCompany,
  asUser,
  unauthenticatedRequest,
} from '../../../packages/test-utils/src/http/authenticatedRequest';
import { createMockModelInstance } from '../../../packages/test-utils/src/mocks/sequelizeModel';
import { validCompanyCreate } from '../../../packages/test-utils/src/fixtures/entities';
import { companyModel } from '../setup/mockModels';

jest.mock('axios');
jest.mock('../../src/services/service', () => ({
  createAccountHttp: jest.fn(),
  deleteOwnAccountBySubjectHttp: jest.fn(),
  deleteCompanyImageHttp: jest.fn(),
  getAuthenticatedCompanyFreightsHttp: jest.fn().mockResolvedValue([]),
  getCompanyImageHttp: jest.fn().mockResolvedValue(null),
  uploadCompanyImageHttp: jest.fn(),
  updateCompanyImageHttp: jest.fn(),
}));

import app from '../../src/app';

describe('company CRUD routes', () => {
  beforeEach(() => {
    companyModel.findByPk.mockReset();
    companyModel.findAll.mockReset();
    companyModel.findOne.mockReset();
    companyModel.create.mockReset();
  });

  describe('POST /company', () => {
    it('retorna 400 com payload inválido', async () => {
      const res = await unauthenticatedRequest(app).post('/company').send({ name: '' });
      expect(res.status).toBe(400);
    });

    it('retorna 201 com payload válido', async () => {
      companyModel.findOne.mockResolvedValueOnce(null);
      companyModel.create.mockResolvedValueOnce(createMockModelInstance({ id: 1, ...validCompanyCreate }));
      const res = await unauthenticatedRequest(app).post('/company').send(validCompanyCreate);
      expect(res.status).toBe(201);
    });
  });

  describe('GET /company', () => {
    it('retorna 401 sem autenticação', async () => {
      const res = await unauthenticatedRequest(app).get('/company');
      expect(res.status).toBe(401);
    });

    it('retorna 403 com role USER', async () => {
      const res = await asUser(app).get('/company');
      expect(res.status).toBe(403);
    });

    it('retorna 200 com ADMIN', async () => {
      companyModel.findAll.mockResolvedValueOnce([createMockModelInstance({ id: 1 })]);
      const res = await asAdmin(app).get('/company');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /company/:id', () => {
    it('retorna 401 sem autenticação', async () => {
      const res = await unauthenticatedRequest(app).get('/company/1');
      expect(res.status).toBe(401);
    });

    it('retorna 200 quando USER consulta empresa', async () => {
      companyModel.findByPk.mockResolvedValueOnce(createMockModelInstance({ id: 1, company_image_id: null }));
      const res = await asUser(app, 99).get('/company/1');
      expect(res.status).toBe(200);
    });

    it('retorna 404 quando não encontrado', async () => {
      companyModel.findByPk.mockResolvedValueOnce(null);
      const res = await asCompany(app, 1).get('/company/1');
      expect(res.status).toBe(404);
    });

    it('retorna 200 quando encontrado', async () => {
      companyModel.findByPk.mockResolvedValueOnce(createMockModelInstance({ id: 1, company_image_id: null }));
      const res = await asCompany(app, 1).get('/company/1');
      expect(res.status).toBe(200);
    });
  });

  describe('PUT /company/:id', () => {
    it('retorna 401 sem autenticação', async () => {
      const res = await unauthenticatedRequest(app).put('/company/1').send({ name: 'Nova' });
      expect(res.status).toBe(401);
    });

    it('retorna 403 quando não é owner', async () => {
      const res = await asCompany(app, 99).put('/company/1').send({ name: 'Nova' });
      expect(res.status).toBe(403);
    });

    it('retorna 404 quando não encontrado', async () => {
      companyModel.findByPk.mockResolvedValueOnce(null);
      const res = await asAdmin(app).put('/company/999').send({ name: 'Nova' });
      expect(res.status).toBe(404);
    });

    it('retorna 200 ao atualizar como owner', async () => {
      companyModel.findByPk.mockResolvedValueOnce(createMockModelInstance({ id: 1, company_image_id: null }));
      const res = await asCompany(app, 1).put('/company/1').send({ name: 'Empresa Atualizada' });
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /company/:id', () => {
    it('retorna 401 sem autenticação', async () => {
      const res = await unauthenticatedRequest(app).delete('/company/1');
      expect(res.status).toBe(401);
    });

    it('retorna 403 quando não é owner', async () => {
      const res = await asCompany(app, 99).delete('/company/1');
      expect(res.status).toBe(403);
    });

    it('retorna 404 quando não encontrado', async () => {
      companyModel.findByPk.mockResolvedValueOnce(null);
      const res = await asAdmin(app).delete('/company/999');
      expect(res.status).toBe(404);
    });

    it('retorna 200 ao remover como owner', async () => {
      companyModel.findByPk.mockResolvedValueOnce(createMockModelInstance({ id: 1 }));
      const res = await asCompany(app, 1).delete('/company/1');
      expect(res.status).toBe(200);
    });
  });
});
