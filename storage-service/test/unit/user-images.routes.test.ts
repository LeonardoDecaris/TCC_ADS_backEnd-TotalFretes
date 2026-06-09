import { createModelMock } from '../../../packages/test-utils/src/mocks/sequelizeModel';
import { definePublicStoredImageCrudTests } from '../../../packages/test-utils/src/jest/publicStoredImageCrudSuite';
import {
  storageUserImageFields,
} from '../../../packages/test-utils/src/fixtures/entities';

const modelMock = createModelMock();

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn(() => false),
  unlinkSync: jest.fn(),
  copyFileSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

jest.mock('../../src/models/userImages.model', () => ({
  __esModule: true,
  default: modelMock,
}));

import app from '../../src/app';

describe('user-images CRUD routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  definePublicStoredImageCrudTests({
    app,
    basePath: '/user-images',
    model: modelMock,
    uploadFields: storageUserImageFields,
    invalidUploadFields: { ownerType: 'INVALID', ownerId: '0' },
    responseKey: 'userImage',
  });
});
