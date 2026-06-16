import { isDemoSeedEnabled, isDemoSeedOnStartupEnabled } from '@total-fretes/demo-seed-data';

import { logger } from '../config/logging';
import { seedCargoTypes } from './seedCargoTypes';
import { seedFreightStatusTypes } from './seedFreightStatusTypes';
import { seedProposalStatusTypes } from './seedProposalStatusTypes';
import { seedDemoFreightsProposals } from './seedDemoFreightsProposals';

/** Catálogos obrigatórios (status de frete/proposta e tipos de carga). */
export const runCatalogSeeds = async (): Promise<void> => {
	await seedFreightStatusTypes();
	await seedProposalStatusTypes();
	await seedCargoTypes();
};

/** Fretes/propostas demo (requer `DEMO_DATA_SEED_ENABLED=true`). */
export const runDemoSeeds = async (): Promise<void> => {
	if (!isDemoSeedEnabled()) {
		logger.info('Demo freights seed skipped (DEMO_DATA_SEED_ENABLED=false)');
		return;
	}

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
