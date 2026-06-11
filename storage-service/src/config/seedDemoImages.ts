import {
	DEMO_CARGO_IMAGES,
	isDemoSeedEnabled,
} from '@total-fretes/demo-seed-data';

import CargoImage from '../models/cargoImage.model';
import { logger } from '../config/logging';
import {
	listStoredImages,
	registerImageFromUploads,
} from '../services/seedImageFromBackup.service';
import { cargoImagesUpload } from '../routes/catalogImages.routes';

export async function seedDemoCargoImages(): Promise<{ created: number; existing: number }> {
	if (!isDemoSeedEnabled()) {
		logger.info('Demo cargo images seed skipped (DEMO_DATA_SEED_ENABLED=false)');
		return { created: 0, existing: 0 };
	}

	let created = 0;
	let existing = 0;

	for (const spec of DEMO_CARGO_IMAGES) {
		const result = await registerImageFromUploads({
			fileName: spec.imageFile,
			originalName: spec.imageFile,
			upload: cargoImagesUpload,
			Model: CargoImage,
		});

		if (!result) {
			logger.warn(`Demo cargo image not found in uploads: ${spec.imageFile}`);
			continue;
		}

		if (result.created) created += 1;
		else existing += 1;
	}

	logger.info(`Demo cargo images seed completed (created=${created}, existing=${existing})`);
	return { created, existing };
}

export async function getDemoCargoImagesCatalog(): Promise<Array<{ id: number; originalName: string }>> {
	return listStoredImages(CargoImage);
}
