import { defineProtectedJsonCrudTests } from '../../../packages/test-utils/src/jest/protectedJsonCrudSuite';
import { validCnhCreate } from '../../../packages/test-utils/src/fixtures/entities';
import { cnhModel } from '../setup/mockModels';

import app from '../../src/app';

describe('cnh CRUD routes', () => {
  defineProtectedJsonCrudTests({
    app,
    basePath: '/cnh',
    model: cnhModel,
    validCreate: validCnhCreate,
    invalidCreate: { name: '' },
    validUpdate: { description: 'Atualizado' },
    roles: {
      create: ['ADMIN'],
      list: ['ADMIN'],
      read: ['ADMIN'],
      update: ['ADMIN'],
      delete: ['ADMIN'],
      forbidden: 'USER',
    },
  });
});
