import { isDemoSeedEnabled, isDemoSeedOnStartupEnabled } from '@total-fretes/demo-seed-data';

import { logger } from '../config/logging';
import { seedCargoTypes } from './seedCargoTypes';
import { seedFreightStatusTypes } from './seedFreightStatusTypes';
import { seedProposalStatusTypes } from './seedProposalStatusTypes';
import { seedDemoFreightsProposals } from './seedDemoFreightsProposals';

/** Catálogos obrigatórios (status de frete e proposta). */
export const runCatalogSeeds = async (): Promise<void> => {
	await seedFreightStatusTypes();
	await seedProposalStatusTypes();
};

/** Tipos de carga demo + fretes/propostas (requer `DEMO_DATA_SEED_ENABLED=true`). */
export const runDemoSeeds = async (): Promise<void> => {
	if (!isDemoSeedEnabled()) {
		logger.info('Demo freights seed skipped (DEMO_DATA_SEED_ENABLED=false)');
		return;
	}

	await seedCargoTypes();
	await seedDemoFreightsProposals();
};

/** Catálogos no startup + seed demo quando `DEMO_DATA_SEED_ON_STARTUP=true`. */
export const runDatabaseSeeds = async (): Promise<void> => {
	await runCatalogSeeds();

	if (!isDemoSeedOnStartupEnabled()) {
		logger.info('Demo freights seed skipped on startup (DEMO_DATA_SEED_ON_STARTUP=false)');
		return;
	}

	await runDemoSeeds();
};
