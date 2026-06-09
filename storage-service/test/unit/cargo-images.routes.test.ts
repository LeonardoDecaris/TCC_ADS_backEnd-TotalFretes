import { createModelMock } from '../../../packages/test-utils/src/mocks/sequelizeModel';
import { definePublicStoredImageCrudTests } from '../../../packages/test-utils/src/jest/publicStoredImageCrudSuite';

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
});
