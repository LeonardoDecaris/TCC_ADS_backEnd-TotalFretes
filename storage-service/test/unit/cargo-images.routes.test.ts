import { createModelMock } from '../../../packages/test-utils/src/mocks/sequelizeModel';
import { asCompany } from '../../../packages/test-utils/src/http/authenticatedRequest';
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

jest.mock('../../src/models/cargoImage.model', () => ({
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

describe('cargo-images CRUD routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retorna 401 sem autenticação no upload', async () => {
    const res = await unauthenticatedRequest(app).post('/cargo-images/upload');
    expect(res.status).toBe(401);
  });

  it('retorna 201 com upload válido para ADMIN', async () => {
    const instance = createMockModelInstance({
      id: 1,
      fileName: 'cargo.png',
      originalName: 'cargo.png',
      mimeType: 'image/png',
      sizeBytes: 100,
      path: 'uploads/cargo-images/cargo.png',
    });
    modelMock.create.mockResolvedValueOnce(instance);

    const res = await attachTestPng(asAdmin(app).post('/cargo-images/upload'));
    expect(res.status).toBe(201);
    expect(res.body.cargoImage).toBeDefined();
  });

  it('retorna 403 para COMPANY no upload de cargo image', async () => {
    const res = await asCompany(app).post('/cargo-images/upload');
    expect(res.status).toBe(403);
  });
});
