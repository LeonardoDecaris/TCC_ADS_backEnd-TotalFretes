import { defineProtectedJsonCrudTests } from '../../../packages/test-utils/src/jest/protectedJsonCrudSuite';
import { validStatusTypeCreate } from '../../../packages/test-utils/src/fixtures/entities';
import { proposalStatusTypeModel } from '../setup/mockModels';

import app from '../../src/app';

describe('proposal-status-type CRUD routes', () => {
  beforeEach(() => jest.clearAllMocks());

  defineProtectedJsonCrudTests({
    app,
    basePath: '/proposal-status-type',
    model: proposalStatusTypeModel,
    validCreate: validStatusTypeCreate,
    invalidCreate: { name: '' },
    validUpdate: { name: 'Aceita' },
    roles: {
      create: ['ADMIN'],
      update: ['ADMIN'],
      delete: ['ADMIN'],
      forbidden: 'USER',
    },
  });
});
