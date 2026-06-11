import fs from 'fs';
import path from 'path';

import dotenv from 'dotenv';

function findProjectRoot(startDir: string): string {
	let dir = path.resolve(startDir);

	while (dir !== path.dirname(dir)) {
		if (fs.existsSync(path.join(dir, 'docker-compose.yml'))) {
			return dir;
		}
		dir = path.dirname(dir);
	}

	return path.resolve(startDir);
}

/** Carrega variáveis compartilhadas do `.env` na raiz do monorepo (sem sobrescrever as do serviço). */
export function loadSharedProjectEnv(): void {
	const rootEnvPath = path.join(findProjectRoot(process.cwd()), '.env');

	if (fs.existsSync(rootEnvPath)) {
		dotenv.config({ path: rootEnvPath });
	}
}
