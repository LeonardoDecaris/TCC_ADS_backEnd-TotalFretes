import dotenv from 'dotenv';
import { loadSharedProjectEnv } from '@total-fretes/demo-seed-data';

dotenv.config();
loadSharedProjectEnv();

async function main(): Promise<void> {
	process.env.DEMO_DATA_SEED_ENABLED = process.env.DEMO_DATA_SEED_ENABLED ?? 'true';

	const sequelize = require('../config/database').default;
	const { runDemoSeeds } = require('../config/runDatabaseSeeds');

	try {
		await sequelize.authenticate();
		await runDemoSeeds();
		console.log('Seeds demo concluídos.');
		process.exit(0);
	} catch (error) {
		console.error('Falha no seed demo:', error);
		process.exit(1);
	}
}

void main();
