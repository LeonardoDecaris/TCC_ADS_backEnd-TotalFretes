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
const integrationDir = path.join(root, 'tests', 'integration');
const summaryFile = getSummaryFileArg();
const resultsDir = getResultsDir(root);
fs.mkdirSync(resultsDir, { recursive: true });

const skipStack = process.argv.includes('--skip-stack');
const composeUp =
  'docker compose -f docker-compose.yml -f docker-compose.test.yml up -d --wait';

const startedAt = Date.now();
let stackError = null;

if (!skipStack && process.env.SKIP_DOCKER_UP !== 'true') {
  console.log('Subindo stack de teste (docker compose)...');
  try {
    execSync(composeUp, { cwd: root, stdio: 'inherit' });
  } catch (error) {
    stackError = error;
    console.error('\n[ERRO] Falha ao subir stack Docker. Containers unhealthy ou timeout.');
    console.error('Dicas:');
    console.error('  - docker compose -f docker-compose.yml -f docker-compose.test.yml ps');
    console.error('  - docker logs swagger-service');
    console.error('  - docker compose build swagger-service mapbox-service');
    throw error;
  }
}

console.log('\n=== Testes de integração ===');

const reportPath = path.join(resultsDir, 'integration.json');
let failed = false;

try {
  execSync(`npx jest --runInBand --json --outputFile="${reportPath}"`, {
    cwd: integrationDir,
    stdio: 'inherit',
  });
} catch {
  failed = true;
}

const stats = parseJestReport(reportPath);
const durationMs = Date.now() - startedAt;

const phaseSummary = {
  type: 'integration',
  title: 'INTEGRACAO (API via Nginx)',
  status: failed ? 'failed' : 'passed',
  durationMs,
  totals: {
    suites: stats.suites,
    tests: stats.tests,
    passed: stats.passed,
    failed: stats.failed,
  },
  failedTests: stats.failedTests,
};

writeSummaryFile(summaryFile, phaseSummary);

if (!summaryFile) {
  printSuiteSummary({
    phases: [phaseSummary],
    totalDurationMs: durationMs,
    overallStatus: failed ? 'failed' : 'passed',
    failedPhase: failed ? 'Integracao' : null,
  });
}

if (failed || stackError) {
  process.exit(1);
}
