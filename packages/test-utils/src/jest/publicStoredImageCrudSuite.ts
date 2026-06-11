import { asAdmin, unauthenticatedRequest, type TestableApp } from '../http/authenticatedRequest';
import { attachTestPng } from '../http/attachTestPng';
import type { ModelMock } from '../mocks/sequelizeModel';
import { createMockModelInstance } from '../mocks/sequelizeModel';

export type PublicStoredImageCrudConfig = {
  app: TestableApp;
  basePath: string;
  model: ModelMock;
  uploadFields: Record<string, string>;
  invalidUploadFields?: Record<string, string>;
  responseKey: string;
};

export function definePublicStoredImageCrudTests(config: PublicStoredImageCrudConfig): void {
  const {
    app,
    basePath,
    model,
    uploadFields,
    invalidUploadFields = {},
    responseKey,
  } = config;

  beforeEach(() => {
    model.findByPk.mockReset();
    model.findAll.mockReset();
    model.create.mockReset();
  });

  describe(`POST ${basePath}/upload`, () => {
    it('retorna 401 sem autenticação', async () => {
      const res = await unauthenticatedRequest(app).post(`${basePath}/upload`).field(uploadFields);
      expect(res.status).toBe(401);
    });

    it('retorna 400 sem arquivo de imagem', async () => {
      const res = await asAdmin(app).post(`${basePath}/upload`).field(uploadFields);
      expect(res.status).toBe(400);
    });

    if (Object.keys(invalidUploadFields).length > 0) {
      it('retorna 400 com campos de upload inválidos', async () => {
        const res = await attachTestPng(
          asAdmin(app).post(`${basePath}/upload`).field(invalidUploadFields),
        );
        expect(res.status).toBe(400);
      });
    }

    it('retorna 400 com assinatura de arquivo inválida', async () => {
      const res = await asAdmin(app)
        .post(`${basePath}/upload`)
        .field(uploadFields)
        .attach('image', Buffer.from('not-an-image'), {
          filename: 'fake.png',
          contentType: 'image/png',
        });
      expect(res.status).toBe(400);
    });

    it('retorna 201 com imagem e campos válidos', async () => {
      const instance = createMockModelInstance({
        id: 1,
        fileName: 'test.png',
        originalName: 'test.png',
        mimeType: 'image/png',
        sizeBytes: 100,
        path: 'uploads/test.png',
        ...uploadFields,
      });
      model.create.mockResolvedValueOnce(instance);

      const res = await attachTestPng(
        asAdmin(app).post(`${basePath}/upload`).field(uploadFields),
      );
      expect(res.status).toBe(201);
      expect(res.body[responseKey]).toBeDefined();
    });
  });

  describe(`GET ${basePath}`, () => {
    it('retorna 401 sem autenticação', async () => {
      const res = await unauthenticatedRequest(app).get(basePath);
      expect(res.status).toBe(401);
    });

    it('retorna 200 com lista', async () => {
      const instance = createMockModelInstance({ id: 1, fileName: 'a.png' });
      model.findAll.mockResolvedValueOnce([instance]);

      const res = await asAdmin(app).get(basePath);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe(`GET ${basePath}/:id`, () => {
    it('retorna 400 com id inválido', async () => {
      const res = await unauthenticatedRequest(app).get(`${basePath}/abc`);
      expect(res.status).toBe(400);
    });

    it('retorna 404 quando não encontrado', async () => {
      model.findByPk.mockResolvedValueOnce(null);
      const res = await unauthenticatedRequest(app).get(`${basePath}/999`);
      expect(res.status).toBe(404);
    });

    it('retorna 200 quando encontrado', async () => {
      const instance = createMockModelInstance({ id: 1, fileName: 'a.png' });
      model.findByPk.mockResolvedValueOnce(instance);
      const res = await unauthenticatedRequest(app).get(`${basePath}/1`);
      expect(res.status).toBe(200);
    });
  });

  describe(`PUT ${basePath}/:id`, () => {
    it('retorna 401 sem autenticação', async () => {
      const res = await attachTestPng(unauthenticatedRequest(app).put(`${basePath}/1`));
      expect(res.status).toBe(401);
    });

    it('retorna 400 com id inválido', async () => {
      const res = await attachTestPng(asAdmin(app).put(`${basePath}/abc`));
      expect(res.status).toBe(400);
    });

    it('retorna 404 quando não encontrado', async () => {
      model.findByPk.mockResolvedValueOnce(null);
      const res = await attachTestPng(asAdmin(app).put(`${basePath}/999`));
      expect(res.status).toBe(404);
    });

    it('retorna 400 sem imagem', async () => {
      const instance = createMockModelInstance({ id: 1, fileName: 'old.png' });
      model.findByPk.mockResolvedValueOnce(instance);
      const res = await asAdmin(app).put(`${basePath}/1`);
      expect(res.status).toBe(400);
    });

    it('retorna 200 ao atualizar', async () => {
      const instance = createMockModelInstance({ id: 1, fileName: 'old.png' });
      const updated = createMockModelInstance({ id: 1, fileName: 'new.png' });
      model.findByPk.mockResolvedValueOnce(instance).mockResolvedValueOnce(updated);

      const res = await attachTestPng(asAdmin(app).put(`${basePath}/1`));
      expect(res.status).toBe(200);
    });
  });

  describe(`DELETE ${basePath}/:id`, () => {
    it('retorna 401 sem autenticação', async () => {
      const res = await unauthenticatedRequest(app).delete(`${basePath}/1`);
      expect(res.status).toBe(401);
    });

    it('retorna 400 com id inválido', async () => {
      const res = await asAdmin(app).delete(`${basePath}/abc`);
      expect(res.status).toBe(400);
    });

    it('retorna 404 quando não encontrado', async () => {
      model.findByPk.mockResolvedValueOnce(null);
      const res = await asAdmin(app).delete(`${basePath}/999`);
      expect(res.status).toBe(404);
    });

    it('retorna 200 ao remover', async () => {
      const instance = createMockModelInstance({ id: 1, fileName: 'a.png' });
      model.findByPk.mockResolvedValueOnce(instance);
      const res = await asAdmin(app).delete(`${basePath}/1`);
      expect(res.status).toBe(200);
    });
  });
}
