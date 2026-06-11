import { createModelMock, type ModelMock } from '../../../packages/test-utils/src/mocks/sequelizeModel';
import { mockDatabaseModule } from '../../../packages/test-utils/src/jest/mockDatabase';

export const userModel: ModelMock = createModelMock();
export const cnhModel: ModelMock = createModelMock();
export const vehicleModel: ModelMock = createModelMock();
export const vehicleTypeModel: ModelMock = createModelMock();
export const groupVehicleTypeModel: ModelMock = createModelMock();

jest.mock('../../src/config/database', () => mockDatabaseModule());
jest.mock('../../src/models/user.model', () => ({ __esModule: true, default: userModel }));
jest.mock('../../src/models/cnh.model', () => ({ __esModule: true, default: cnhModel }));
jest.mock('../../src/models/vehicle.model', () => ({ __esModule: true, default: vehicleModel }));
jest.mock('../../src/models/vehicleType.model', () => ({ __esModule: true, default: vehicleTypeModel }));
jest.mock('../../src/models/groupVehicleType.model', () => ({ __esModule: true, default: groupVehicleTypeModel }));
