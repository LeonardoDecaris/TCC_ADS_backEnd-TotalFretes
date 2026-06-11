/**
 * Reexecuta as seeds demo nos serviços (stack já em execução).
 *
 * Uso (variáveis em .env na raiz do backend):
 *   npm run seed:demo
 *
 * Com Docker Compose sem portas publicadas no host, o script detecta automaticamente
 * e executa via `docker compose exec` (SEED_VIA_DOCKER=auto, padrão).
 *
 * Variáveis opcionais no .env raiz:
 *   DEMO_DATA_SEED_ENABLED
 *   INTERNAL_SERVICE_KEY
 *   SEED_VIA_DOCKER=auto|true|false
 *   STORAGE_SERVICE_URL (default http://127.0.0.1:3007)
 *   COMPANY_SERVICE_URL (default http://127.0.0.1:3002)
 *   USER_SERVICE_URL (default http://127.0.0.1:3001)
 */
const { execSync } = require('child_process');
const path = require('path');

const { loadSharedProjectEnv } = require('../packages/demo-seed-data/dist/loadSharedProjectEnv');

loadSharedProjectEnv();

const projectRoot = path.join(__dirname, '..');
const internalKey = process.env.INTERNAL_SERVICE_KEY?.trim() ?? '';
const headers = internalKey
	? { 'x-service-key': internalKey, 'Content-Type': 'application/json' }
	: { 'Content-Type': 'application/json' };

const storageUrl = process.env.STORAGE_SERVICE_URL?.trim() || 'http://127.0.0.1:3007';
const companyUrl = process.env.COMPANY_SERVICE_URL?.trim() || 'http://127.0.0.1:3002';
const userUrl = process.env.USER_SERVICE_URL?.trim() || 'http://127.0.0.1:3001';

const SEED_STEPS = [
	{ label: 'storage-service cargo images', service: 'storage-service', port: 3007, url: storageUrl },
	{ label: 'company-service empresas demo', service: 'company-service', port: 3002, url: companyUrl },
	{ label: 'user-service motoristas demo', service: 'user-service', port: 3001, url: userUrl },
];

function parseSeedViaDockerMode() {
	const raw = process.env.SEED_VIA_DOCKER?.trim().toLowerCase();
	if (raw === 'true' || raw === '1') return 'docker';
	if (raw === 'false' || raw === '0') return 'host';
	return 'auto';
}

function isComposeServiceRunning(serviceName) {
	try {
		const status = execSync(`docker compose ps --status running --format "{{.Name}}" ${serviceName}`, {
			cwd: projectRoot,
			encoding: 'utf8',
			stdio: ['pipe', 'pipe', 'pipe'],
		}).trim();
		return status === serviceName;
	} catch {
		return false;
	}
}

async function isHostReachable(baseUrl) {
	try {
		const response = await fetch(`${baseUrl}/health`, { signal: AbortSignal.timeout(2000) });
		return response.ok;
	} catch {
		return false;
	}
}

async function resolveExecutionMode() {
	const mode = parseSeedViaDockerMode();
	if (mode === 'docker') return 'docker';
	if (mode === 'host') return 'host';

	const dockerAvailable = isComposeServiceRunning('storage-service');
	if (!dockerAvailable) return 'host';

	const hostReachable = await isHostReachable(storageUrl);
	return hostReachable ? 'host' : 'docker';
}

async function postJsonHost(url, body = {}) {
	const response = await fetch(`${url}/internal/seed/run`, {
		method: 'POST',
		headers,
		body: JSON.stringify(body),
	});
	if (!response.ok) {
		const text = await response.text();
		throw new Error(`${url}/internal/seed/run -> ${response.status}: ${text}`);
	}
	return response.json();
}

function postJsonDocker(serviceName, port) {
	const script = `
const key = process.env.INTERNAL_SERVICE_KEY || '';
const headers = { 'Content-Type': 'application/json' };
if (key) headers['x-service-key'] = key;
fetch('http://127.0.0.1:${port}/internal/seed/run', {
	method: 'POST',
	headers,
	body: '{}',
}).then(async (response) => {
	const text = await response.text();
	if (!response.ok) {
		console.error(text);
		process.exit(1);
	}
	console.log(text);
}).catch((error) => {
	console.error(error);
	process.exit(1);
});
`;

	const output = execSync(`docker compose exec -T -e INTERNAL_SERVICE_KEY=${internalKey} ${serviceName} node -`, {
		cwd: projectRoot,
		input: script,
		encoding: 'utf8',
		stdio: ['pipe', 'pipe', 'pipe'],
		env: process.env,
	});

	const trimmed = output.trim();
	return trimmed ? JSON.parse(trimmed) : {};
}

async function postJson(step, mode) {
	if (mode === 'docker') {
		return postJsonDocker(step.service, step.port);
	}
	return postJsonHost(step.url);
}

function runFreightSeed(mode) {
	if (mode === 'docker') {
		execSync('docker compose exec -T freight-service npm run seed:demo', {
			cwd: projectRoot,
			stdio: 'inherit',
			env: {
				...process.env,
				DEMO_DATA_SEED_ENABLED: process.env.DEMO_DATA_SEED_ENABLED ?? 'true',
			},
		});
		return;
	}

	const freightDir = path.join(projectRoot, 'freight-service');
	execSync('npm run seed:demo', {
		cwd: freightDir,
		stdio: 'inherit',
		env: {
			...process.env,
			DEMO_DATA_SEED_ENABLED: process.env.DEMO_DATA_SEED_ENABLED ?? 'true',
		},
	});
}

async function main() {
	if (!internalKey) {
		console.warn('[warn] INTERNAL_SERVICE_KEY não definido; rotas internas podem retornar 403.');
	}

	if (process.env.DEMO_DATA_SEED_ENABLED?.trim().toLowerCase() === 'false') {
		console.warn('[warn] DEMO_DATA_SEED_ENABLED=false no .env raiz; rotas internas podem ignorar a seed.');
	}

	const mode = await resolveExecutionMode();
	if (mode === 'docker') {
		console.log('[info] Serviços acessíveis via Docker Compose (portas não expostas no host).');
	}

	for (let index = 0; index < SEED_STEPS.length; index += 1) {
		const step = SEED_STEPS[index];
		console.log(`${index + 1}/4 ${step.label}...`);
		console.log(await postJson(step, mode));
	}

	console.log('4/4 freight-service tipos de carga + fretes + propostas...');
	runFreightSeed(mode);

	console.log('Seed demo concluída.');
}

main().catch((error) => {
	console.error('Falha na seed demo:', error);
	process.exit(1);
});
