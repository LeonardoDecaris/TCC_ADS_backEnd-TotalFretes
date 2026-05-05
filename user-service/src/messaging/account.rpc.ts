/**
 * user-service/src/messaging/account.rpc.ts
 *
 * Typed wrapper for the account-creation RPC call.
 * Keeps the queue name and payload shape co-located, away from controllers.
 */

import { rpcCall } from './rpc.client';
import type { RpcEnvelope } from '../shared/rpc.types';

const ACCOUNT_CREATE_QUEUE =
  process.env.ACCOUNT_CREATE_RPC_QUEUE ?? 'account.create.rpc';

export type CreateAccountPayload = {
  email: string;
  password: string;
  subject_id: number;
  account_type_id: number;
};

export function createAccountRpc(
  payload: CreateAccountPayload,
): Promise<RpcEnvelope> {
  return rpcCall(ACCOUNT_CREATE_QUEUE, payload);
}