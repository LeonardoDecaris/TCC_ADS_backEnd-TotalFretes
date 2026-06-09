/**
 * Roda testes de um único microserviço (ideal para demos/apresentações).
 *
 * Uso:
 *   node scripts/test-service.js mapbox
 *   node scripts/test-service.js freight --with-integration
 *   node scripts/test-service.js --list
 *
 * Aliases: auth, user, company, freight, storage, mapbox, email, swagger
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const {
  getResultsDir,
  parseJestReport,
  printSuiteSummary,
} = require('./lib/test-summary');

const root = path.resolve(__dirname, '..');
const resultsDir = getResultsDir(root);
fs.mkdirSync(resultsDir, { recursive: true });

const SERVICE_CATALOG = {
  'authentication-service': {
    aliases: ['auth', 'authentication', 'authentication-service'],
    label: 'Autenticação',
    integrationFlows: ['00-health-all-services.test.ts', '01-auth-account.test.ts'],
  },
  'user-service': {
    aliases: ['user', 'user-service'],
    label: 'Usuário',
    integrationFlows: ['00-health-all-services.test.ts', '02-user-vehicle.test.ts'],
  },
  'company-service': {
    aliases: ['company', 'company-service'],
    label: 'Empresa',
    integrationFlows: ['00-health-all-services.test.ts', '03-company-address.test.ts'],
  },
  'freight-service': {
    aliases: ['freight', 'freight-service'],
    label: 'Frete',
    integrationFlows: ['00-health-all-services.test.ts', '04-freight-proposal.test.ts'],
  },
  'storage-service': {
    aliases: ['storage', 'storage-service'],
    label: 'Storage',
    integrationFlows: ['00-health-all-services.test.ts', '05-storage-upload.test.ts'],
  },
  'mapbox-service': {
    aliases: ['mapbox', 'mapbox-service'],
    label: 'Mapbox',
    integrationFlows: ['06-mapbox-proxy.test.ts'],
  },
  'email-management-service': {
    aliases: ['email', 'email-management', 'email-management-service'],
    label: 'E-mail',
    integrationFlows: ['00-health-all-services.test.ts', '07-email-queue.test.ts'],
  },
  'swagger-service': {
    aliases: ['swagger', 'swagger-service', 'docs'],
    label: 'Swagger',
    integrationFlows: ['08-swagger-aggregation.test.ts'],
  },
};

const aliasIndex = new Map();
for (const [serviceName, meta] of Object.entries(SERVICE_CATALOG)) {
  for (const alias of meta.aliases) {
    aliasIndex.set(alias.toLowerCase(), serviceName);
  }
}

function parseArgs(argv) {
  const flags = new Set();
  const positional = [];

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      flags.add(arg);
      continue;
    }
    positional.push(arg);
  }

  return {
    flags,
    serviceArg: positional[0]?.toLowerCase(),
  };
}

function printHelp() {
  console.log('\nTestes por serviço (modo apresentação — muito mais rápido que test:all)\n');
  console.log('Uso:');
  console.log('  npm run test:service -- <serviço>');
  console.log('  npm run test:service -- <serviço> --with-integration');
  console.log('  npm run test:service -- <serviço> --with-integration --skip-stack\n');
  console.log('Serviços disponíveis:\n');

  for (const [serviceName, meta] of Object.entries(SERVICE_CATALOG)) {
    const aliases = meta.aliases.filter((alias) => alias !== serviceName).join(', ');
    const flows = meta.integrationFlows.length;
    console.log(`  ${pad(meta.aliases[0], 10)}  ${meta.label.padEnd(14)}  (${serviceName})`);
    console.log(`             aliases: ${aliases}`);
    console.log(`             integração: ${flows} flow(s) com --with-integration\n`);
  }

  console.log('Exemplos:');
  console.log('  npm run test:service -- mapbox              # só unitários (~5s)');
  console.log('  npm run test:service -- auth               # só unitários (~30s)');
  console.log('  npm run test:service -- freight --with-integration --skip-stack');
  console.log('');
}

function pad(text, len) {
  return text.length >= len ? text : text + ' '.repeat(len - text.length);
}

function resolveService(serviceArg) {
  if (!serviceArg) return null;
  return aliasIndex.get(serviceArg) ?? null;
}

function runUnitTests(serviceName) {
  const cwd = path.join(root, serviceName);
  const reportPath = path.join(resultsDir, `service-${serviceName}-unit.json`);
  const startedAt = Date.now();

  console.log(`\n=== Unitários: ${serviceName} ===`);

  try {
    execSync(`npx jest --runInBand --json --outputFile="${reportPath}"`, {
      cwd,
      stdio: 'inherit',
    });
    return {
      status: 'passed',
      ...parseJestReport(reportPath),
      durationMs: Date.now() - startedAt,
    };
  } catch {
    return {
      status: 'failed',
      ...parseJestReport(reportPath),
      durationMs: Date.now() - startedAt,
    };
  }
}

function runIntegrationFlows(serviceName, skipStack) {
  const meta = SERVICE_CATALOG[serviceName];
  const integrationDir = path.join(root, 'tests', 'integration');
  const flowArgs = meta.integrationFlows
    .map((file) => `flows/${file}`)
    .map((file) => `"${file}"`)
    .join(' ');

  if (!skipStack && process.env.SKIP_DOCKER_UP !== 'true') {
    console.log('\nSubindo stack de teste (docker compose)...');
    execSync(
      'docker compose -f docker-compose.yml -f docker-compose.test.yml up -d --wait',
      { cwd: root, stdio: 'inherit' },
    );
  }

  const reportPath = path.join(resultsDir, `service-${serviceName}-integration.json`);
  const startedAt = Date.now();
  console.log(`\n=== Integração: ${serviceName} (${meta.integrationFlows.length} flow(s)) ===`);

  try {
    execSync(
      `npx jest --runInBand --json --outputFile="${reportPath}" ${flowArgs}`,
      { cwd: integrationDir, stdio: 'inherit' },
    );
    return {
      status: 'passed',
      ...parseJestReport(reportPath),
      durationMs: Date.now() - startedAt,
    };
  } catch {
    return {
      status: 'failed',
      ...parseJestReport(reportPath),
      durationMs: Date.now() - startedAt,
    };
  }
}

const { flags, serviceArg } = parseArgs(process.argv);

if (flags.has('--help') || flags.has('-h') || serviceArg === 'help') {
  printHelp();
  process.exit(0);
}

if (flags.has('--list') || serviceArg === 'list') {
  printHelp();
  process.exit(0);
}

const serviceName = resolveService(serviceArg);
if (!serviceName) {
  console.error('\n[ERRO] Serviço não informado ou inválido.\n');
  printHelp();
  process.exit(1);
}

const withIntegration = flags.has('--with-integration');
const skipStack = flags.has('--skip-stack');
const meta = SERVICE_CATALOG[serviceName];
const startedAt = Date.now();
const phases = [];

console.log(`\n${'='.repeat(60)}`);
console.log(`Testes do serviço: ${meta.label} (${serviceName})`);
console.log(`Modo: ${withIntegration ? 'unitários + integração' : 'somente unitários (rápido)'}`);
console.log(`${'='.repeat(60)}`);

const unitResult = runUnitTests(serviceName);
phases.push({
  type: 'unit',
  title: `UNITARIOS — ${meta.label}`,
  status: unitResult.status,
  durationMs: unitResult.durationMs,
  services: [
    {
      name: serviceName,
      status: unitResult.status,
      suites: unitResult.suites,
      tests: unitResult.tests,
      passed: unitResult.passed,
      failed: unitResult.failed,
      durationMs: unitResult.durationMs,
      failedTests: unitResult.failedTests,
    },
  ],
  totals: {
    suites: unitResult.suites,
    tests: unitResult.tests,
    passed: unitResult.passed,
    failed: unitResult.failed,
  },
});

let failed = unitResult.status === 'failed';

if (withIntegration) {
  try {
    const integrationResult = runIntegrationFlows(serviceName, skipStack);
    phases.push({
      type: 'integration',
      title: `INTEGRACAO — ${meta.label}`,
      status: integrationResult.status,
      durationMs: integrationResult.durationMs,
      totals: {
        suites: integrationResult.suites,
        tests: integrationResult.tests,
        passed: integrationResult.passed,
        failed: integrationResult.failed,
      },
      failedTests: integrationResult.failedTests,
    });
    if (integrationResult.status === 'failed') failed = true;
  } catch {
    failed = true;
    phases.push({
      type: 'integration',
      title: `INTEGRACAO — ${meta.label}`,
      status: 'failed',
      durationMs: 0,
      totals: { suites: 0, tests: 0, passed: 0, failed: 0 },
      failedTests: [],
    });
  }
}

printSuiteSummary({
  phases,
  totalDurationMs: Date.now() - startedAt,
  overallStatus: failed ? 'failed' : 'passed',
  failedPhase: failed
    ? phases.find((phase) => phase.status === 'failed')?.title ?? 'Desconhecida'
    : null,
});

process.exit(failed ? 1 : 0);
