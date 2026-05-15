import type { Transaction } from 'sequelize';
import FreightStatusHistory from '../models/freightStatusHistory.model';

/** Registra uma transição real de `status_id` do frete (ignora se o status não mudou). */
export async function recordFreightStatusHistory(
	freightId: number,
	newStatusId: number,
	previousStatusId: number | null | undefined,
	options?: { transaction?: Transaction }
): Promise<void> {
	const prev = previousStatusId ?? null;
	if (newStatusId === prev) return;
	await FreightStatusHistory.create(
		{
			freight_id: freightId,
			status_id: newStatusId,
			occurred_at: new Date(),
		},
		{ transaction: options?.transaction }
	);
}
