export type MockModelInstance = Record<string, unknown> & {
  getDataValue: (key: string) => unknown;
  toJSON: () => Record<string, unknown>;
  update: jest.Mock;
  destroy: jest.Mock;
};

export function createMockModelInstance(
  data: Record<string, unknown> = {},
): MockModelInstance {
  const record = { ...data };
  return {
    ...record,
    getDataValue: (key: string) => record[key],
    toJSON: () => ({ ...record }),
    update: jest.fn(async (updates: Record<string, unknown>) => {
      Object.assign(record, updates);
      return record;
    }),
    destroy: jest.fn(async () => undefined),
  };
}

export type ModelMock = {
  findByPk: jest.Mock;
  findAll: jest.Mock;
  findOne: jest.Mock;
  create: jest.Mock;
  destroy: jest.Mock;
  findAndCountAll: jest.Mock;
  update: jest.Mock;
};

export function createModelMock(): ModelMock {
  return {
    findByPk: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
    findAndCountAll: jest.fn(),
    update: jest.fn(),
  };
}
