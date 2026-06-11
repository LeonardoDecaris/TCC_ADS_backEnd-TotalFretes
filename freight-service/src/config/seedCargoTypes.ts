import {
	DEMO_CARGO_TYPE_NAMES,
	DEMO_CARGO_IMAGES,
	getCargoImageFileByCargoName,
	isDemoSeedEnabled,
} from '@total-fretes/demo-seed-data';

import CargoType from '../models/cargoTypes.model';
import { fetchDemoCargoImagesHttp, withDemoSeedRetry } from '../services/demoSeedHttp.service';
import { logger } from '../config/logging';

async function seedDemoCargoTypes(): Promise<void> {
	const cargoImages = await withDemoSeedRetry(async () => {
		const rows = await fetchDemoCargoImagesHttp();
		if (rows.length === 0) {
			throw new Error('Demo cargo images catalog is empty');
		}
		return rows;
	});

	const imageIdByOriginalName = new Map(cargoImages.map((row) => [row.originalName, row.id]));

	for (const spec of DEMO_CARGO_IMAGES) {
		const imageId = imageIdByOriginalName.get(spec.imageFile);
		if (!imageId) {
			logger.warn(`Demo cargo type seed: image not found for ${spec.imageFile}`);
			continue;
		}

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

	for (const name of DEMO_CARGO_TYPE_NAMES) {
		if (!getCargoImageFileByCargoName(name)) {
			logger.warn(`Demo cargo type seed: manifest missing image mapping for ${name}`);
		}
	}

	logger.info(`Demo cargo types seed completed (${DEMO_CARGO_TYPE_NAMES.length} types)`);
}

export const seedCargoTypes = async (): Promise<void> => {
	if (!isDemoSeedEnabled()) {
		logger.info('Demo cargo types seed skipped (DEMO_DATA_SEED_ENABLED=false)');
		return;
	}

	await seedDemoCargoTypes();
};
