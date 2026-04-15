import FreightStatusType from '../models/freightStatusTypes.model';
import { FreightStatusSlug } from './statusTypes.constants';

/** Ciclo de vida sugerido: open → assigned → in_transit → delivered (cancelled em qualquer momento). */
const DEFAULT_FREIGHT_STATUS_TYPES: readonly string[] = [
	FreightStatusSlug.OPEN,
	FreightStatusSlug.ASSIGNED,
	FreightStatusSlug.IN_TRANSIT,
	FreightStatusSlug.DELIVERED,
	FreightStatusSlug.CANCELLED,
];

export const seedFreightStatusTypes = async (): Promise<void> => {
	for (const name of DEFAULT_FREIGHT_STATUS_TYPES) {
		await FreightStatusType.findOrCreate({
			where: { name },
			defaults: { name },
		});
	}
};
