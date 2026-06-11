import { defineProtectedJsonCrudTests } from '../../../packages/test-utils/src/jest/protectedJsonCrudSuite';
import { validGroupVehicleTypeCreate } from '../../../packages/test-utils/src/fixtures/entities';
import { groupVehicleTypeModel } from '../setup/mockModels';

import app from '../../src/app';

describe('group-vehicle-type CRUD routes', () => {
  defineProtectedJsonCrudTests({
    app,
    basePath: '/group-vehicle-type',
    model: groupVehicleTypeModel,
    validCreate: validGroupVehicleTypeCreate,
    invalidCreate: { nome: '' },
    validUpdate: { nome: 'Atualizado' },
    roles: {
      create: ['ADMIN'],
      update: ['ADMIN'],
      delete: ['ADMIN'],
      forbidden: 'USER',
    },
  });
});
