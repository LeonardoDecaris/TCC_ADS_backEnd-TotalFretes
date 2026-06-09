import { createModelMock } from '../../../packages/test-utils/src/mocks/sequelizeModel';
import { definePublicStoredImageCrudTests } from '../../../packages/test-utils/src/jest/publicStoredImageCrudSuite';
import { storageCompanyImageFields } from '../../../packages/test-utils/src/fixtures/entities';

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
});
