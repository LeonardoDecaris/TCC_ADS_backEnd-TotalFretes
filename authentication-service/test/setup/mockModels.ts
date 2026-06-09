import { createModelMock, type ModelMock } from '../../../packages/test-utils/src/mocks/sequelizeModel';
import { mockDatabaseModule } from '../../../packages/test-utils/src/jest/mockDatabase';

export const accountModel: ModelMock = createModelMock();
export const accountTypeModel: ModelMock = createModelMock();

jest.mock('../../src/config/database', () => mockDatabaseModule());
jest.mock('../../src/models/accounts.model', () => ({ Account: accountModel }));
jest.mock('../../src/models/accounts_types.model', () => ({
  __esModule: true,
  default: accountTypeModel,
  AccountType: accountTypeModel,
}));
