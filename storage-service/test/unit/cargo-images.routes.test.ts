import { createModelMock } from '../../../packages/test-utils/src/mocks/sequelizeModel';
import { definePublicStoredImageCrudTests } from '../../../packages/test-utils/src/jest/publicStoredImageCrudSuite';
import { asCompany } from '../../../packages/test-utils/src/http/authenticatedRequest';

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

  definePublicStoredImageCrudTests({
    app,
    basePath: '/cargo-images',
    model: modelMock,
    uploadFields: {},
    invalidUploadFields: {},
    responseKey: 'cargoImage',
  });

  it('retorna 403 para COMPANY no upload de cargo image', async () => {
    const res = await asCompany(app).post('/cargo-images/upload');
    expect(res.status).toBe(403);
  });
});
