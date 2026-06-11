export type MockResponseState = {
  statusCode: number;
  body: unknown;
  locals: { requestId: string };
  status: (code: number) => MockResponseState;
  json: (payload: unknown) => MockResponseState;
};

export function createMockResponse(): MockResponseState {
  const res: MockResponseState = {
    statusCode: 200,
    body: undefined,
    locals: { requestId: 'test-request-id' },
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
