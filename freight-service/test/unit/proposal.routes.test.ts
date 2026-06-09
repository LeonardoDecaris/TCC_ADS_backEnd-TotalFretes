import {
  asCompany,
  asUser,
  unauthenticatedRequest,
} from '../../../packages/test-utils/src/http/authenticatedRequest';
import { createMockModelInstance } from '../../../packages/test-utils/src/mocks/sequelizeModel';
import { validProposalCreate } from '../../../packages/test-utils/src/fixtures/entities';

import app from '../../src/app';

const proposalRow = createMockModelInstance({ id: 1, ...validProposalCreate });

import * as proposalService from '../../src/services/proposal.service';

describe('proposal CRUD routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (proposalService.createProposalRecord as jest.Mock).mockReset();
    (proposalService.listProposals as jest.Mock).mockReset();
    (proposalService.getProposalByIdRecord as jest.Mock).mockReset();
    (proposalService.updateProposalRecord as jest.Mock).mockReset();
    (proposalService.deleteProposalRecord as jest.Mock).mockReset();
    (proposalService.assertCanViewProposal as jest.Mock).mockReset();
  });

  describe('POST /proposal', () => {
    it('retorna 401 sem autenticação', async () => {
      const res = await unauthenticatedRequest(app).post('/proposal').send(validProposalCreate);
      expect(res.status).toBe(401);
    });

    it('retorna 403 com role COMPANY', async () => {
      const res = await asCompany(app).post('/proposal').send(validProposalCreate);
      expect(res.status).toBe(403);
    });

    it('retorna 400 com payload inválido', async () => {
      const res = await asUser(app).post('/proposal').send({ value: -1 });
      expect(res.status).toBe(400);
    });

    it('retorna 201 com USER e payload válido', async () => {
      (proposalService.createProposalRecord as jest.Mock).mockResolvedValueOnce(proposalRow);
      const res = await asUser(app).post('/proposal').send(validProposalCreate);
      expect(res.status).toBe(201);
    });
  });

  describe('GET /proposal', () => {
    it('retorna 401 sem autenticação', async () => {
      const res = await unauthenticatedRequest(app).get('/proposal');
      expect(res.status).toBe(401);
    });

    it('retorna 200 listando propostas', async () => {
      (proposalService.listProposals as jest.Mock).mockResolvedValueOnce({
        paginated: false,
        items: [proposalRow],
      });
      const res = await asUser(app).get('/proposal');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /proposal/:id', () => {
    it('retorna 401 sem autenticação', async () => {
      const res = await unauthenticatedRequest(app).get('/proposal/1');
      expect(res.status).toBe(401);
    });

    it('retorna 404 quando não encontrado', async () => {
      (proposalService.getProposalByIdRecord as jest.Mock).mockResolvedValueOnce(null);
      const res = await asUser(app).get('/proposal/999');
      expect(res.status).toBe(404);
    });

    it('retorna 200 quando encontrado', async () => {
      (proposalService.getProposalByIdRecord as jest.Mock).mockResolvedValueOnce(proposalRow);
      (proposalService.assertCanViewProposal as jest.Mock).mockReturnValueOnce(undefined);
      const res = await asUser(app).get('/proposal/1');
      expect(res.status).toBe(200);
    });
  });

  describe('PUT /proposal/:id', () => {
    it('retorna 401 sem autenticação', async () => {
      const res = await unauthenticatedRequest(app).put('/proposal/1').send({ value: 900 });
      expect(res.status).toBe(401);
    });

    it('retorna 403 com role COMPANY', async () => {
      const err = new proposalService.ProposalForbiddenError();
      (proposalService.updateProposalRecord as jest.Mock).mockRejectedValueOnce(err);
      const res = await asCompany(app).put('/proposal/1').send({ value: 900 });
      expect(res.status).toBe(403);
    });

    it('retorna 404 quando não encontrado', async () => {
      const err = new proposalService.ProposalNotFoundError();
      (proposalService.updateProposalRecord as jest.Mock).mockRejectedValueOnce(err);
      const res = await asUser(app).put('/proposal/999').send({ value: 900 });
      expect(res.status).toBe(404);
    });

    it('retorna 200 ao atualizar', async () => {
      (proposalService.updateProposalRecord as jest.Mock).mockResolvedValueOnce(proposalRow);
      const res = await asUser(app).put('/proposal/1').send({ value: 900 });
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /proposal/:id', () => {
    it('retorna 401 sem autenticação', async () => {
      const res = await unauthenticatedRequest(app).delete('/proposal/1');
      expect(res.status).toBe(401);
    });

    it('retorna 403 com role COMPANY', async () => {
      const err = new proposalService.ProposalForbiddenError();
      (proposalService.deleteProposalRecord as jest.Mock).mockRejectedValueOnce(err);
      const res = await asCompany(app).delete('/proposal/1');
      expect(res.status).toBe(403);
    });

    it('retorna 404 quando não encontrado', async () => {
      const err = new proposalService.ProposalNotFoundError();
      (proposalService.deleteProposalRecord as jest.Mock).mockRejectedValueOnce(err);
      const res = await asUser(app).delete('/proposal/999');
      expect(res.status).toBe(404);
    });

    it('retorna 200 ao remover', async () => {
      (proposalService.deleteProposalRecord as jest.Mock).mockResolvedValueOnce(undefined);
      const res = await asUser(app).delete('/proposal/1');
      expect(res.status).toBe(200);
    });
  });
});
