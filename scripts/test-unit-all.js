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

const services = [
  'authentication-service',
  'user-service',
  'company-service',
  'freight-service',
  'storage-service',
  'mapbox-service',
  'email-management-service',
  'swagger-service',
];

const startedAt = Date.now();
const serviceResults = [];
let failed = false;

for (const service of services) {
  const cwd = path.join(root, service);
  const reportPath = path.join(resultsDir, `unit-${service}.json`);
  console.log(`\n=== Unit tests: ${service} ===`);

  try {
    execSync(`npx jest --runInBand --json --outputFile="${reportPath}"`, {
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
  title: 'UNITARIOS (8 microservicos)',
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
