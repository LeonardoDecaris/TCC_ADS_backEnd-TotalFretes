import { createSequelizeMock } from '../mocks/sequelize';

export function mockDatabaseModule(): { default: ReturnType<typeof createSequelizeMock> } {
  return { default: createSequelizeMock() };
}
