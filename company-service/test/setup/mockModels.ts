import { createModelMock, type ModelMock } from '../../../packages/test-utils/src/mocks/sequelizeModel';
import { mockDatabaseModule } from '../../../packages/test-utils/src/jest/mockDatabase';

export const companyModel: ModelMock = createModelMock();
export const addressModel: ModelMock = createModelMock();

jest.mock('../../src/config/database', () => mockDatabaseModule());
jest.mock('../../src/models/company.model', () => ({ __esModule: true, default: companyModel }));
jest.mock('../../src/models/address.model', () => ({ __esModule: true, default: addressModel }));
