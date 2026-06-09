import { defineProtectedJsonCrudTests } from '../../../packages/test-utils/src/jest/protectedJsonCrudSuite';
import { validCargoTypeCreate } from '../../../packages/test-utils/src/fixtures/entities';
import { cargoTypeModel } from '../setup/mockModels';

import app from '../../src/app';

describe('cargo-type CRUD routes', () => {
  defineProtectedJsonCrudTests({
    app,
    basePath: '/cargo-type',
    model: cargoTypeModel,
    validCreate: validCargoTypeCreate,
    invalidCreate: { name: '' },
    validUpdate: { name: 'Atualizado' },
    roles: {
      create: ['COMPANY'],
      update: ['COMPANY'],
      delete: ['COMPANY'],
      forbidden: 'USER',
    },
  });
});
