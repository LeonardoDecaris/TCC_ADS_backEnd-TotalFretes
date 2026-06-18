import {
	CATALOG_CARGO_IMAGES,
	isDemoSeedEnabled,
} from '@total-fretes/demo-seed-data';

import CargoImage from '../models/cargoImage.model';
import { logger } from '../config/logging';
import {
	listStoredImages,
	registerImageFromUploads,
} from '../services/seedImageFromBackup.service';
import { cargoImagesUpload } from '../routes/catalogImages.routes';

async function registerCatalogCargoImages(): Promise<{ created: number; existing: number }> {
	let created = 0;
	let existing = 0;

	for (const spec of CATALOG_CARGO_IMAGES) {
		const result = await registerImageFromUploads({
			fileName: spec.imageFile,
			originalName: spec.imageFile,
			upload: cargoImagesUpload,
			Model: CargoImage,
		});

		if (!result) {
			logger.warn(`Catalog cargo image not found: ${spec.imageFile}`);
			continue;
		}

		if (result.created) created += 1;
		else existing += 1;
	}

	return { created, existing };
}

/** Seed obrigatório de imagens de tipos de carga (catálogo). Roda sempre no startup. */
export async function seedCatalogCargoImages(): Promise<{ created: number; existing: number }> {
	const result = await registerCatalogCargoImages();
	logger.info(`Catalog cargo images seed completed (created=${result.created}, existing=${result.existing})`);
	return result;
}

/** Reexecuta seed de imagens de carga via rota interna demo (requer DEMO_DATA_SEED_ENABLED). */
export async function seedDemoCargoImages(): Promise<{ created: number; existing: number }> {
	if (!isDemoSeedEnabled()) {
		logger.info('Demo cargo images seed skipped (DEMO_DATA_SEED_ENABLED=false)');
		return { created: 0, existing: 0 };
	}

	return registerCatalogCargoImages();
}

export async function getDemoCargoImagesCatalog(): Promise<Array<{ id: number; originalName: string }>> {
	return listStoredImages(CargoImage);
}
