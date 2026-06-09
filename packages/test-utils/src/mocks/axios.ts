import axios from 'axios';

export function getMockedAxios(): jest.Mocked<typeof axios> {
  return axios as jest.Mocked<typeof axios>;
}

export function mockAxiosSuccess(data: unknown, status = 200): void {
  const mocked = getMockedAxios();
  mocked.get.mockResolvedValueOnce({ data, status });
  mocked.post.mockResolvedValueOnce({ data, status });
  mocked.put.mockResolvedValueOnce({ data, status });
  mocked.patch.mockResolvedValueOnce({ data, status });
  mocked.delete.mockResolvedValueOnce({ data, status });
}

export function mockAxiosError(status: number, data: unknown = { message: 'error' }): void {
  const mocked = getMockedAxios();
  const error = Object.assign(new Error('axios error'), {
    response: { status, data },
    isAxiosError: true,
  });
  mocked.get.mockRejectedValueOnce(error);
  mocked.post.mockRejectedValueOnce(error);
  mocked.put.mockRejectedValueOnce(error);
  mocked.patch.mockRejectedValueOnce(error);
  mocked.delete.mockRejectedValueOnce(error);
}
