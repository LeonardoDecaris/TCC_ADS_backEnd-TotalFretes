const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const {
  getResultsDir,
  getSummaryFileArg,
  parseJestReport,
  printSuiteSummary,
  writeSummaryFile,
} = require('./lib/test-summary');

const root = path.resolve(__dirname, '..');
const summaryFile = getSummaryFileArg();
const resultsDir = getResultsDir(root);
fs.mkdirSync(resultsDir, { recursive: true });

const ALL_SERVICES = [
  'authentication-service',
  'user-service',
  'company-service',
  'freight-service',
  'storage-service',
  'mapbox-service',
  'email-management-service',
  'swagger-service',
];

function normalizeServiceAlias(value) {
  const alias = String(value).trim().toLowerCase();
  const map = {
    auth: 'authentication-service',
    authentication: 'authentication-service',
    'authentication-service': 'authentication-service',
    user: 'user-service',
    'user-service': 'user-service',
    company: 'company-service',
    'company-service': 'company-service',
    freight: 'freight-service',
    'freight-service': 'freight-service',
    storage: 'storage-service',
    'storage-service': 'storage-service',
    mapbox: 'mapbox-service',
    'mapbox-service': 'mapbox-service',
    email: 'email-management-service',
    'email-management': 'email-management-service',
    'email-management-service': 'email-management-service',
    swagger: 'swagger-service',
    docs: 'swagger-service',
    'swagger-service': 'swagger-service',
  };
  return map[alias] ?? null;
}

function parseArgs(argv) {
  const args = argv.slice(2);
  let servicesArg = null;
  let changedOnly = false;
  const passthroughJestArgs = [];

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      return { help: true, services: ALL_SERVICES, changedOnly: false, passthroughJestArgs: [] };
    }
    if (arg === '--changed') {
      changedOnly = true;
      continue;
    }
    if (arg.startsWith('--services=')) {
      servicesArg = arg.slice('--services='.length);
      continue;
    }
    if (arg === '--services' && args[i + 1]) {
      servicesArg = args[i + 1];
      i += 1;
      continue;
    }
    if (arg === '--summary-file') {
      i += 1;
      continue;
    }
    passthroughJestArgs.push(arg);
  }

  const selectedServices = servicesArg
    ? servicesArg
      .split(',')
      .map((item) => normalizeServiceAlias(item))
      .filter(Boolean)
    : null;

  const uniqueServices = selectedServices
    ? [...new Set(selectedServices)]
    : ALL_SERVICES;

  return {
    help: false,
    services: uniqueServices,
    changedOnly,
    passthroughJestArgs,
  };
}

function printHelp() {
  console.log('\nExecuta testes unitários dos microserviços.\n');
  console.log('Uso:');
  console.log('  npm run test:unit');
  console.log('  npm run test:unit -- --services=auth,freight');
  console.log('  npm run test:unit -- --changed');
  console.log('  npm run test:unit -- --services=user -- --testPathPattern=vehicle\n');
}

function collectChangedServices() {
  try {
    const output = execSync('git diff --name-only --relative HEAD', {
      cwd: root,
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf8',
    });
    const files = output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (files.length === 0) return ALL_SERVICES;

    const services = new Set();
    for (const file of files) {
      const topLevel = file.split(/[\\/]/)[0];
      if (ALL_SERVICES.includes(topLevel)) {
        services.add(topLevel);
        continue;
      }
      if (
        topLevel === 'packages'
        || topLevel === 'scripts'
        || topLevel === 'tests'
        || topLevel === 'docker-compose.yml'
        || topLevel === 'package.json'
      ) {
        return ALL_SERVICES;
      }
    }
    return services.size > 0 ? [...services] : ALL_SERVICES;
  } catch {
    return ALL_SERVICES;
  }
}

const { help, services: selectedServices, changedOnly, passthroughJestArgs } = parseArgs(process.argv);
if (help) {
  printHelp();
  process.exit(0);
}

const services = changedOnly ? collectChangedServices() : selectedServices;
if (!services.length) {
  console.error('[ERRO] Nenhum serviço válido selecionado para executar testes unitários.');
  process.exit(1);
}

const startedAt = Date.now();
const serviceResults = [];
let failed = false;

for (const service of services) {
  const cwd = path.join(root, service);
  const reportPath = path.join(resultsDir, `unit-${service}.json`);
  console.log(`\n=== Unit tests: ${service} ===`);

  try {
    const jestArgs = passthroughJestArgs.join(' ');
    execSync(`npx jest --runInBand --json --outputFile="${reportPath}" ${jestArgs}`.trim(), {
      cwd,
      stdio: 'inherit',
    });
    const stats = parseJestReport(reportPath);
    serviceResults.push({
      name: service,
      status: 'passed',
      ...stats,
    });
  } catch {
    failed = true;
    const stats = parseJestReport(reportPath);
    serviceResults.push({
      name: service,
      status: 'failed',
      ...stats,
    });
    console.error(`[FAIL] ${service}`);
  }
}

const durationMs = Date.now() - startedAt;
const totals = serviceResults.reduce(
  (acc, item) => ({
    suites: acc.suites + item.suites,
    tests: acc.tests + item.tests,
    passed: acc.passed + item.passed,
    failed: acc.failed + item.failed,
  }),
  { suites: 0, tests: 0, passed: 0, failed: 0 },
);

const phaseSummary = {
  type: 'unit',
  title: `UNITARIOS (${services.length} microservicos)`,
  status: failed ? 'failed' : 'passed',
  durationMs,
  services: serviceResults,
  totals,
};

writeSummaryFile(summaryFile, phaseSummary);

if (!summaryFile) {
  printSuiteSummary({
    phases: [phaseSummary],
    totalDurationMs: durationMs,
    overallStatus: failed ? 'failed' : 'passed',
    failedPhase: failed ? 'Unitarios' : null,
  });
}

if (failed) {
  process.exit(1);
}
