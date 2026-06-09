import { createModelMock } from '../mocks/sequelizeModel';
import { mockDatabaseModule } from './mockDatabase';

export function setupModelRouteMocks(modelPath: string) {
  const modelMock = createModelMock();

  jest.mock('../../src/config/database', () => mockDatabaseModule());
  jest.mock(modelPath, () => ({
    __esModule: true,
    default: modelMock,
  }));

  return modelMock;
}
