import { createModelMock } from '../../../packages/test-utils/src/mocks/sequelizeModel';
import { storageCompanyImageFields } from '../../../packages/test-utils/src/fixtures/entities';
import { asUser } from '../../../packages/test-utils/src/http/authenticatedRequest';
import { asAdmin, unauthenticatedRequest } from '../../../packages/test-utils/src/http/authenticatedRequest';
import { attachTestPng } from '../../../packages/test-utils/src/http/attachTestPng';
import { createMockModelInstance } from '../../../packages/test-utils/src/mocks/sequelizeModel';

const modelMock = createModelMock();

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn(() => false),
  unlinkSync: jest.fn(),
  copyFileSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

jest.mock('../../src/models/companyImage.model', () => ({
  __esModule: true,
  default: modelMock,
}));

jest.mock('../../src/services/imageOutbox.service', () => ({
  enqueueImageEvent: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../src/services/imageIdempotency.service', () => ({
  normalizeIdempotencyKey: jest.fn(() => null),
  buildIdempotencyFingerprint: jest.fn(() => 'fingerprint'),
  getIdempotencyReplay: jest.fn().mockResolvedValue(null),
  storeIdempotencyResponse: jest.fn().mockResolvedValue(undefined),
}));

import app from '../../src/app';

describe('company-images CRUD routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retorna 401 sem autenticação no upload', async () => {
    const res = await unauthenticatedRequest(app).post('/company-images/upload').field(storageCompanyImageFields);
    expect(res.status).toBe(401);
  });

  it('retorna 201 com upload válido', async () => {
    const instance = createMockModelInstance({
      id: 1,
      fileName: 'company.png',
      originalName: 'company.png',
      mimeType: 'image/png',
      sizeBytes: 100,
      path: 'uploads/company-images/company.png',
      companyId: 10,
    });
    modelMock.create.mockResolvedValueOnce(instance);

    const res = await attachTestPng(
      asAdmin(app).post('/company-images/upload').field(storageCompanyImageFields),
    );
    expect(res.status).toBe(201);
    expect(res.body.companyImage).toBeDefined();
  });

  it('retorna 403 para USER no upload de company image', async () => {
    const res = await asUser(app).post('/company-images/upload').field(storageCompanyImageFields);
    expect(res.status).toBe(403);
  });
});
