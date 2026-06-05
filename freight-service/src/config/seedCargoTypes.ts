import CargoType from '../models/cargoTypes.model';

const DEFAULT_CARGO_TYPES: Array<{
	name: string;
	vehicleType: string;
}> = [
	{ name: 'Minerais', vehicleType: '4' },
	{ name: 'Grãos', vehicleType: '5' },
	{ name: 'Adubo', vehicleType: '4' },
	{ name: 'Líquido', vehicleType: '5' },
];

export const seedCargoTypes = async (): Promise<void> => {
	for (const cargoType of DEFAULT_CARGO_TYPES) {
		await CargoType.findOrCreate({
			where: { name: cargoType.name },
			defaults: cargoType,
		});
	}
};