import { registerHandler } from './rpc.consumer';
import { createAccountRecord, type AccountCreationInput } from '../services/accountCreation.service';
import { rpcError, success } from '../shared/rpc.types';


const ACCOUNT_CREATE_QUEUE =
  process.env.ACCOUNT_CREATE_RPC_QUEUE ?? 'account.create.rpc';

export function registerAccountHandler(): void {
  registerHandler<Partial<AccountCreationInput>>(
    ACCOUNT_CREATE_QUEUE,
    async (raw) => {
      if (typeof raw !== 'object' || raw === null) {
        return rpcError('invalid payload');
      }

      const result = await createAccountRecord({
        email: String(raw.email ?? ''),
        password: String(raw.password ?? ''),
        subject_id: Number(raw.subject_id),
        account_type_id: Number(raw.account_type_id),
      });

      if (result.ok) return success();

      return rpcError(result.reason);
    },
  );
}