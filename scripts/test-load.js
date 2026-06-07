const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const {
  getResultsDir,
  getSummaryFileArg,
  parseK6Summary,
  printSuiteSummary,
  writeSummaryFile,
} = require('./lib/test-summary');

const root = path.resolve(__dirname, '..');
const summaryFile = getSummaryFileArg();
const resultsDir = getResultsDir(root);
fs.mkdirSync(resultsDir, { recursive: true });

function getPositionalArgs(argv) {
  const positional = [];
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === '--summary-file') {
      i += 1;
      continue;
    }
    positional.push(argv[i]);
  }
  return positional;
}

const scenario = getPositionalArgs(process.argv)[0] || 'smoke';

const scenarios = {
  smoke: 'tests/load/k6/scenarios/smoke.js',
  auth: 'tests/load/k6/scenarios/auth-login.js',
  'freight-read': 'tests/load/k6/scenarios/freight-read.js',
  'freight-write': 'tests/load/k6/scenarios/freight-write.js',
  all: null,
};

const startedAt = Date.now();
const scenarioResults = [];
let failed = false;

function runScenario(key) {
  const script = path.join(root, scenarios[key]);
  const k6SummaryPath = path.join(resultsDir, `k6-${key}.json`);

  console.log(`\n=== K6: ${key} ===`);
  const scenarioStartedAt = Date.now();

  try {
    execSync(`k6 run --summary-export "${k6SummaryPath}" "${script}"`, {
      cwd: root,
      stdio: 'inherit',
    });
    const stats = parseK6Summary(k6SummaryPath);
    scenarioResults.push({
      name: key,
      status: 'passed',
      durationMs: Date.now() - scenarioStartedAt,
      ...stats,
    });
  } catch {
    failed = true;
    const stats = parseK6Summary(k6SummaryPath);
    scenarioResults.push({
      name: key,
      status: 'failed',
      durationMs: Date.now() - scenarioStartedAt,
      ...stats,
    });
    console.error(`[FAIL] K6 cenário: ${key}`);
  }
}

if (scenario === 'all') {
  for (const key of ['smoke', 'auth', 'freight-read', 'freight-write']) {
    runScenario(key);
  }
} else {
  const script = scenarios[scenario];
  if (!script) {
    console.error(`Cenário desconhecido: ${scenario}. Use: ${Object.keys(scenarios).join(', ')}`);
    process.exit(1);
  }
  runScenario(scenario);
}

const durationMs = Date.now() - startedAt;
const totals = scenarioResults.reduce(
  (acc, item) => ({
    scenarios: acc.scenarios + 1,
    checksPassed: acc.checksPassed + item.checksPassed,
    checksFailed: acc.checksFailed + item.checksFailed,
  }),
  { scenarios: 0, checksPassed: 0, checksFailed: 0 },
);

const phaseSummary = {
  type: 'load',
  title: 'CARGA (K6)',
  status: failed ? 'failed' : 'passed',
  durationMs,
  scenarios: scenarioResults,
  totals,
};

writeSummaryFile(summaryFile, phaseSummary);

if (!summaryFile) {
  printSuiteSummary({
    phases: [phaseSummary],
    totalDurationMs: durationMs,
    overallStatus: failed ? 'failed' : 'passed',
    failedPhase: failed ? 'Carga (K6)' : null,
  });
}

if (failed) {
  process.exit(1);
}
