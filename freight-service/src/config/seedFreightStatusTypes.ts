import FreightStatusType from '../models/freightStatusTypes.model';
import { FreightStatusSlug } from './statusTypes.constants';

/** Ordem: Disponível (1) … Concluído (7). */
const DEFAULT_FREIGHT_STATUS_TYPES: readonly string[] = [
	FreightStatusSlug.DISPONIVEL,
	FreightStatusSlug.CANCELADO,
	FreightStatusSlug.VINCULADO,
	FreightStatusSlug.EM_TRANSITO,
	FreightStatusSlug.EM_ROTA_ENTREGA,
	FreightStatusSlug.ENTREGUE,
	FreightStatusSlug.CONCLUIDO,
];

export const seedFreightStatusTypes = async (): Promise<void> => {
	for (const name of DEFAULT_FREIGHT_STATUS_TYPES) {
		await FreightStatusType.findOrCreate({
			where: { name },
			defaults: { name },
		});
	}
};
