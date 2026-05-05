/**
 * RPC envelope contract — keep aligned with user-service and authentication-service.
 */
export type RpcStatus = 'pending' | 'success' | 'error';

export type RpcEnvelope<T = undefined> =
  | { status: 'pending' }
  | { status: 'success'; data?: T }
  | { status: 'error';   reason: string };

export const pending = (): RpcEnvelope<never> =>
  ({ status: 'pending' });

export const success = <T>(data?: T): RpcEnvelope<T> =>
  data !== undefined ? { status: 'success', data } : { status: 'success' };

export const rpcError = (reason: string): RpcEnvelope<never> =>
  ({ status: 'error', reason });

export const isSuccess = <T>(e: RpcEnvelope<T>): e is { status: 'success'; data?: T } =>
  e.status === 'success';

export const isError = <T>(e: RpcEnvelope<T>): e is { status: 'error'; reason: string } =>
  e.status === 'error';
