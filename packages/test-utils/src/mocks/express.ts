export type MockResponseState = {
  statusCode: number;
  body: unknown;
  locals: Record<string, unknown>;
  status: (code: number) => MockResponseState;
  json: (payload: unknown) => MockResponseState;
};

export function createMockResponse(): MockResponseState {
  const res: MockResponseState = {
    statusCode: 200,
    body: undefined,
    locals: {},
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return res;
}
