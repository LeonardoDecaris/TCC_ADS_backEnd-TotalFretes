import CargoType from '../models/cargoTypes.model';
import { fetchDemoCargoImagesHttp, withDemoSeedRetry } from '../services/demoSeedHttp.service';
import { CATALOG_CARGO_IMAGES } from './cargoTypes.constants';

export const seedCargoTypes = async (): Promise<void> => {
	const cargoImages = await withDemoSeedRetry(async () => {
		const rows = await fetchDemoCargoImagesHttp();
		if (rows.length === 0) {
			throw new Error('Catalog cargo images catalog is empty');
		}
		return rows;
	});

	const imageIdByOriginalName = new Map(cargoImages.map((row) => [row.originalName, row.id]));

	for (const spec of CATALOG_CARGO_IMAGES) {
		const imageId = imageIdByOriginalName.get(spec.imageFile);
		if (!imageId) continue;

		for (const name of spec.cargoNames) {
			const [row, created] = await CargoType.findOrCreate({
				where: { name },
				defaults: { name, imageCargo_id: imageId },
			});

			if (!created) {
				await row.update({ imageCargo_id: imageId });
			}
		}
	}
};
