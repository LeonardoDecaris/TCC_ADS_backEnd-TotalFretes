import { createModelMock } from '../../../packages/test-utils/src/mocks/sequelizeModel';
import { definePublicStoredImageCrudTests } from '../../../packages/test-utils/src/jest/publicStoredImageCrudSuite';
import { storageCompanyImageFields } from '../../../packages/test-utils/src/fixtures/entities';
import { asUser } from '../../../packages/test-utils/src/http/authenticatedRequest';

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

  definePublicStoredImageCrudTests({
    app,
    basePath: '/company-images',
    model: modelMock,
    uploadFields: storageCompanyImageFields,
    invalidUploadFields: { companyId: '0' },
    responseKey: 'companyImage',
  });

  it('retorna 403 para USER no upload de company image', async () => {
    const res = await asUser(app).post('/company-images/upload').field(storageCompanyImageFields);
    expect(res.status).toBe(403);
  });
});
