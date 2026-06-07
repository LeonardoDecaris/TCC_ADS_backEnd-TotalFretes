export function createSequelizeMock() {
  return {
    authenticate: jest.fn().mockResolvedValue(undefined),
    sync: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    transaction: jest.fn(async (fn: (t: unknown) => Promise<unknown>) => fn({})),
    define: jest.fn(),
    query: jest.fn().mockResolvedValue([]),
  };
}
