export function createSequelizeMock() {
  return {
    authenticate: jest.fn().mockResolvedValue(undefined),
    sync: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    transaction: jest.fn(async (fn?: (t: unknown) => Promise<unknown>) => {
      if (typeof fn === 'function') {
        return fn({});
      }
      return {
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined),
      };
    }),
    define: jest.fn(() => ({
      findByPk: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      destroy: jest.fn(),
      belongsTo: jest.fn(),
      hasMany: jest.fn(),
      init: jest.fn(),
    })),
    query: jest.fn().mockResolvedValue([]),
    models: {},
  };
}
