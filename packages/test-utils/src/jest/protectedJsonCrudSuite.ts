import type { ModelMock } from '../mocks/sequelizeModel';
import type { TestableApp } from '../http/authenticatedRequest';
import { createMockModelInstance } from '../mocks/sequelizeModel';
import {
  asAdmin,
  asCompany,
  asUser,
  unauthenticatedRequest,
} from '../http/authenticatedRequest';
import type { TestJwtRole } from '../jwt/createTestToken';

function resetModelMock(model: ModelMock): void {
  model.findByPk.mockReset();
  model.findAll.mockReset();
  model.findOne.mockReset();
  model.create.mockReset();
  model.destroy.mockReset();
  model.findAndCountAll.mockReset();
  model.update.mockReset();
}

export type RoleMatrix = {
  create?: TestJwtRole[];
  list?: TestJwtRole[];
  read?: TestJwtRole[];
  update?: TestJwtRole[];
  delete?: TestJwtRole[];
  forbidden?: TestJwtRole;
};

export type ProtectedJsonCrudConfig = {
  app: TestableApp;
  basePath: string;
  model: ModelMock;
  validCreate: Record<string, unknown>;
  invalidCreate?: Record<string, unknown>;
  validUpdate?: Record<string, unknown>;
  roles: RoleMatrix;
  usePatchForUpdate?: boolean;
  listResponseIsArray?: boolean;
  listUsesFindAndCountAll?: boolean;
  ownerIdForRead?: number;
};

function auth(app: TestableApp, role: TestJwtRole, id = 1) {
  if (role === 'ADMIN') return asAdmin(app, id);
  if (role === 'COMPANY') return asCompany(app, id);
  return asUser(app, id);
}

export function defineProtectedJsonCrudTests(config: ProtectedJsonCrudConfig): void {
  const {
    app,
    basePath,
    model,
    validCreate,
    invalidCreate = {},
    validUpdate = { name: 'Atualizado' },
    roles,
    usePatchForUpdate = false,
    listResponseIsArray = true,
    listUsesFindAndCountAll = false,
    ownerIdForRead = 1,
  } = config;

  const writeRole = roles.create?.[0] ?? 'ADMIN';
  const readRole = roles.read?.[0] ?? roles.list?.[0] ?? 'ADMIN';
  const forbidden = roles.forbidden ?? (writeRole === 'ADMIN' ? 'USER' : 'USER');

  beforeEach(() => {
    resetModelMock(model);
  });

  describe(`POST ${basePath}`, () => {
    it('retorna 401 sem autenticação', async () => {
      const res = await unauthenticatedRequest(app).post(basePath).send(validCreate);
      expect(res.status).toBe(401);
    });

    if (roles.create && roles.create.length > 0) {
      it(`retorna 403 com role ${forbidden} não autorizada`, async () => {
        const res = await auth(app, forbidden).post(basePath).send(validCreate);
        expect(res.status).toBe(403);
      });

      it('retorna 400 com payload inválido', async () => {
        const res = await auth(app, writeRole).post(basePath).send(invalidCreate);
        expect(res.status).toBe(400);
      });

      it('retorna 201 com payload válido', async () => {
        const instance = createMockModelInstance({ id: 1, ...validCreate });
        model.create.mockResolvedValueOnce(instance);
        const res = await auth(app, writeRole).post(basePath).send(validCreate);
        expect(res.status).toBe(201);
      });
    }
  });

  describe(`GET ${basePath}`, () => {
    it('retorna 401 sem autenticação', async () => {
      const res = await unauthenticatedRequest(app).get(basePath);
      expect(res.status).toBe(401);
    });

    if (roles.list) {
      it(`retorna 403 com role ${forbidden} não autorizada`, async () => {
        const res = await auth(app, forbidden).get(basePath);
        expect(res.status).toBe(403);
      });
    }

    it('retorna 200 listando registros', async () => {
      const instance = createMockModelInstance({ id: 1, ...validCreate });
      if (listUsesFindAndCountAll) {
        model.findAndCountAll.mockResolvedValueOnce({ rows: [instance], count: 1 });
      } else {
        model.findAll.mockResolvedValueOnce([instance]);
      }
      const listRole = roles.list?.[0] ?? readRole;
      const res = await auth(app, listRole).get(basePath);
      expect(res.status).toBe(200);
      if (listResponseIsArray) {
        expect(Array.isArray(res.body) || Array.isArray(res.body.items)).toBe(true);
      }
    });
  });

  describe(`GET ${basePath}/:id`, () => {
    it('retorna 401 sem autenticação', async () => {
      const res = await unauthenticatedRequest(app).get(`${basePath}/999`);
      expect(res.status).toBe(401);
    });

    it('retorna 404 quando não encontrado', async () => {
      model.findByPk.mockResolvedValueOnce(null);
      const res = await auth(app, readRole, ownerIdForRead).get(`${basePath}/999`);
      expect(res.status).toBe(404);
    });

    it('retorna 200 quando encontrado', async () => {
      const instance = createMockModelInstance({ id: 1, ...validCreate });
      model.findByPk.mockResolvedValueOnce(instance);
      const res = await auth(app, readRole, ownerIdForRead).get(`${basePath}/1`);
      expect(res.status).toBe(200);
    });
  });

  const updateMethod = usePatchForUpdate ? 'patch' : 'put';

  describe(`${updateMethod.toUpperCase()} ${basePath}/:id`, () => {
    it('retorna 401 sem autenticação', async () => {
      const res = await unauthenticatedRequest(app)[updateMethod](`${basePath}/1`).send(validUpdate);
      expect(res.status).toBe(401);
    });

    if (roles.update) {
      it(`retorna 403 com role ${forbidden} não autorizada`, async () => {
        const res = await auth(app, forbidden)[updateMethod](`${basePath}/1`).send(validUpdate);
        expect(res.status).toBe(403);
      });
    }

    it('retorna 404 quando não encontrado', async () => {
      model.findByPk.mockResolvedValueOnce(null);
      const updateRole = roles.update?.[0] ?? writeRole;
      const res = await auth(app, updateRole)[updateMethod](`${basePath}/999`).send(validUpdate);
      expect(res.status).toBe(404);
    });

    it('retorna 400 com payload inválido', async () => {
      const instance = createMockModelInstance({ id: 1, ...validCreate });
      model.findByPk.mockResolvedValueOnce(instance);
      const updateRole = roles.update?.[0] ?? writeRole;
      const res = await auth(app, updateRole)[updateMethod](`${basePath}/1`).send(invalidCreate);
      expect([400, 422]).toContain(res.status);
    });

    it('retorna 200 ao atualizar', async () => {
      const instance = createMockModelInstance({ id: 1, ...validCreate });
      model.findByPk.mockResolvedValueOnce(instance);
      const updateRole = roles.update?.[0] ?? writeRole;
      const res = await auth(app, updateRole)[updateMethod](`${basePath}/1`).send(validUpdate);
      expect(res.status).toBe(200);
    });
  });

  describe(`DELETE ${basePath}/:id`, () => {
    it('retorna 401 sem autenticação', async () => {
      const res = await unauthenticatedRequest(app).delete(`${basePath}/1`);
      expect(res.status).toBe(401);
    });

    if (roles.delete) {
      it(`retorna 403 com role ${forbidden} não autorizada`, async () => {
        const res = await auth(app, forbidden).delete(`${basePath}/1`);
        expect(res.status).toBe(403);
      });
    }

    it('retorna 404 quando não encontrado', async () => {
      model.findByPk.mockResolvedValueOnce(null);
      const deleteRole = roles.delete?.[0] ?? writeRole;
      const res = await auth(app, deleteRole).delete(`${basePath}/999`);
      expect(res.status).toBe(404);
    });

    it('retorna 200 ao remover', async () => {
      const instance = createMockModelInstance({ id: 1, ...validCreate });
      model.findByPk.mockResolvedValueOnce(instance);
      const deleteRole = roles.delete?.[0] ?? writeRole;
      const res = await auth(app, deleteRole).delete(`${basePath}/1`);
      expect([200, 204]).toContain(res.status);
    });
  });
}

export type PublicJsonCrudConfig = {
  app: TestableApp;
  basePath: string;
  model: ModelMock;
  validCreate: Record<string, unknown>;
  invalidCreate?: Record<string, unknown>;
  validUpdate?: Record<string, unknown>;
  usePatchForUpdate?: boolean;
  mockCreate?: () => void;
};

export function definePublicJsonCrudTests(config: PublicJsonCrudConfig): void {
  const {
    app,
    basePath,
    model,
    validCreate,
    invalidCreate = {},
    validUpdate = { name: 'Atualizado' },
    usePatchForUpdate = false,
    mockCreate,
  } = config;

  describe(`POST ${basePath}`, () => {
    it('retorna 400 com payload inválido', async () => {
      const res = await unauthenticatedRequest(app).post(basePath).send(invalidCreate);
      expect(res.status).toBe(400);
    });

    it('retorna 201 com payload válido', async () => {
      if (mockCreate) mockCreate();
      else {
        const instance = createMockModelInstance({ id: 1, ...validCreate });
        model.create.mockResolvedValueOnce(instance);
      }
      const res = await unauthenticatedRequest(app).post(basePath).send(validCreate);
      expect(res.status).toBe(201);
    });
  });

  describe(`GET ${basePath}/:id`, () => {
    it('retorna 404 quando não encontrado', async () => {
      model.findByPk.mockResolvedValueOnce(null);
      const res = await unauthenticatedRequest(app).get(`${basePath}/999`);
      expect(res.status).toBe(404);
    });

    it('retorna 200 quando encontrado', async () => {
      const instance = createMockModelInstance({ id: 1, ...validCreate });
      model.findByPk.mockResolvedValueOnce(instance);
      const res = await unauthenticatedRequest(app).get(`${basePath}/1`);
      expect(res.status).toBe(200);
    });
  });
}

export type AuthOnlyEndpointConfig = {
  app: TestableApp;
  method: 'get' | 'post' | 'patch' | 'put' | 'delete';
  path: string;
  body?: Record<string, unknown>;
  allowedRole: TestJwtRole;
  forbiddenRole?: TestJwtRole;
  setupSuccess?: () => void;
  expectedSuccessStatus?: number;
};

export function defineAuthOnlyEndpointTests(config: AuthOnlyEndpointConfig): void {
  const {
    app,
    method,
    path,
    body,
    allowedRole,
    forbiddenRole = 'USER',
    setupSuccess,
    expectedSuccessStatus = 200,
  } = config;

  describe(`${method.toUpperCase()} ${path}`, () => {
    it('retorna 401 sem autenticação', async () => {
      const req = unauthenticatedRequest(app)[method](path);
      const res = body ? await req.send(body) : await req;
      expect(res.status).toBe(401);
    });

    it(`retorna 403 com role ${forbiddenRole}`, async () => {
      const req = auth(app, forbiddenRole)[method](path);
      const res = body ? await req.send(body) : await req;
      expect(res.status).toBe(403);
    });

    it('retorna sucesso com role autorizada', async () => {
      if (setupSuccess) setupSuccess();
      const req = auth(app, allowedRole)[method](path);
      const res = body ? await req.send(body) : await req;
      expect(res.status).toBe(expectedSuccessStatus);
    });
  });
}
