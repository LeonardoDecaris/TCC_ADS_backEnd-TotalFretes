import {
  DEFAULT_ACCOUNT_CREATE_RPC_QUEUE,
  accountCreateRequestSchema,
  parseRpcPayload,
} from '@total-fretes/rpc-contracts';
import { registerHandler } from './rpc.consumer';
import { createAccountRecord } from '../services/accountCreation.service';
import { rpcError, success } from '../shared/rpc.types';

const ACCOUNT_CREATE_QUEUE =
  process.env.ACCOUNT_CREATE_RPC_QUEUE ?? DEFAULT_ACCOUNT_CREATE_RPC_QUEUE;

export function registerAccountRpcConsumer(): void {
  registerHandler(
    ACCOUNT_CREATE_QUEUE,
    async (raw) => {
      const parsed = parseRpcPayload(accountCreateRequestSchema, raw);
      if (!parsed.success) return rpcError('validation_failed');

      const result = await createAccountRecord(parsed.data);

      if (result.ok) return success();

      if (result.reason === 'exists') return rpcError('account exists');
      return rpcError('account creation failed');
    },
  );
}
