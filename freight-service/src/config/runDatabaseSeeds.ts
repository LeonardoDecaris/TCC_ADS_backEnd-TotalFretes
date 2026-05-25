import { seedCargoTypes } from './seedCargoTypes';
import { seedFreightStatusTypes } from './seedFreightStatusTypes';
import { seedProposalStatusTypes } from './seedProposalStatusTypes';
import {
	seedTestFreightsProposals,
	type SeedTestFreightsProposalsOptions,
} from './seedTestFreightsProposals';

export const parseSeedTestDriverIds = (raw: string | undefined): number[] => {
	const ids = (raw ?? '2,3,4,5')
		.split(',')
		.map((part) => Number(part.trim()))
		.filter((id) => !Number.isNaN(id) && id > 0);
	return ids;
};

export const getSeedTestFreightsProposalsOptions = (): SeedTestFreightsProposalsOptions => {
	const companyId = Number(process.env.SEED_TEST_COMPANY_ID ?? '1');
	if (Number.isNaN(companyId) || companyId <= 0) {
		throw new Error('SEED_TEST_COMPANY_ID inválido (use o ID da empresa no login).');
	}

	const driverIds = parseSeedTestDriverIds(process.env.SEED_TEST_DRIVER_IDS);
	if (driverIds.length < 4) {
		throw new Error('Informe ao menos 4 IDs em SEED_TEST_DRIVER_IDS (ex.: 2,3,4,5).');
	}

	return { companyId, driverIds };
};

/** Catálogos + dados de teste TF-TEST-* (mesmo fluxo do `npm run dev` / `start`). */
export const runDatabaseSeeds = async (): Promise<void> => {
	await seedCargoTypes();
	await seedFreightStatusTypes();
	await seedProposalStatusTypes();

	const skipTestData = process.env.SEED_TEST_DATA === 'false';
	if (skipTestData) {
		return;
	}

	await seedTestFreightsProposals(getSeedTestFreightsProposalsOptions());
};
