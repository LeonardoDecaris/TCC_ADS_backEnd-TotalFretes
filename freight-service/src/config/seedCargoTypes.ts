import CargoType from '../models/cargoTypes.model';

const DEFAULT_CARGO_TYPES: Array<{ name: string }> = [
	{ name: 'Minerais' },
	{ name: 'Grãos' },
	{ name: 'Adubo' },
	{ name: 'Líquido' },
];

export const seedCargoTypes = async (): Promise<void> => {
	for (const cargoType of DEFAULT_CARGO_TYPES) {
		await CargoType.findOrCreate({
			where: { name: cargoType.name },
			defaults: cargoType,
		});
	}
};
