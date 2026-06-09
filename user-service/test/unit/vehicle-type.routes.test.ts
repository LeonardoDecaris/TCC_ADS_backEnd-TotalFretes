import { defineProtectedJsonCrudTests } from '../../../packages/test-utils/src/jest/protectedJsonCrudSuite';
import { validVehicleTypeCreate } from '../../../packages/test-utils/src/fixtures/entities';
import { vehicleTypeModel } from '../setup/mockModels';

import app from '../../src/app';

describe('vehicle-type CRUD routes', () => {
  defineProtectedJsonCrudTests({
    app,
    basePath: '/vehicle-type',
    model: vehicleTypeModel,
    validCreate: validVehicleTypeCreate,
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
