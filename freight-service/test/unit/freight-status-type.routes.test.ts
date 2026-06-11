import { defineProtectedJsonCrudTests } from '../../../packages/test-utils/src/jest/protectedJsonCrudSuite';
import { validStatusTypeCreate } from '../../../packages/test-utils/src/fixtures/entities';
import { freightStatusTypeModel } from '../setup/mockModels';

import app from '../../src/app';

describe('freight-status-type CRUD routes', () => {
  beforeEach(() => jest.clearAllMocks());

  defineProtectedJsonCrudTests({
    app,
    basePath: '/freight-status-type',
    model: freightStatusTypeModel,
    validCreate: validStatusTypeCreate,
    invalidCreate: { name: '' },
    validUpdate: { name: 'Concluído' },
    roles: {
      create: ['ADMIN'],
      update: ['ADMIN'],
      delete: ['ADMIN'],
      forbidden: 'USER',
    },
  });
});
