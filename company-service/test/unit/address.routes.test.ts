import { defineProtectedJsonCrudTests } from '../../../packages/test-utils/src/jest/protectedJsonCrudSuite';
import { validAddressCreate } from '../../../packages/test-utils/src/fixtures/entities';
import { addressModel } from '../setup/mockModels';

import app from '../../src/app';

describe('address CRUD routes', () => {
  defineProtectedJsonCrudTests({
    app,
    basePath: '/address',
    model: addressModel,
    validCreate: validAddressCreate,
    invalidCreate: { cep: '' },
    validUpdate: { city: 'Campinas' },
    roles: {
      create: ['COMPANY'],
      list: ['COMPANY'],
      read: ['COMPANY'],
      update: ['COMPANY'],
      delete: ['COMPANY'],
      forbidden: 'USER',
    },
  });
});
