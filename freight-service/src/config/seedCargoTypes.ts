import CargoType from '../models/cargoTypes.model';

const DEFAULT_CARGO_TYPES: Array<{
	name: string;
	vehicleType: string;
	imageCargo_id: number;
}> = [
	{ name: 'Minerais', vehicleType: '4', imageCargo_id: 1 },
	{ name: 'Grãos', vehicleType: '5', imageCargo_id: 2 },
	{ name: 'Adubo', vehicleType: '4', imageCargo_id: 3 },
	{ name: 'Líquido', vehicleType: '5', imageCargo_id: 4 },
];

export const seedCargoTypes = async (): Promise<void> => {
	for (const cargoType of DEFAULT_CARGO_TYPES) {
		await CargoType.findOrCreate({
			where: { name: cargoType.name },
			defaults: cargoType,
		});
	}
};