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

function resolveK6Binary() {
  if (process.env.K6_BIN) {
    return process.env.K6_BIN;
  }

  try {
    execSync('k6 version', { stdio: 'ignore' });
    return 'k6';
  } catch {
    // PATH pode não incluir k6 logo após instalação via winget/MSI.
  }

  const candidates = [
    'C:\\Program Files\\k6\\k6.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WinGet', 'Links', 'k6.exe'),
  ];

  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) {
      return `"${candidate}"`;
    }
  }

  return 'k6';
}

const k6Binary = resolveK6Binary();

function getPositionalArgs(argv) {
  const positional = [];
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === '--summary-file') {
      i += 1;
      continue;
    }
    if (argv[i].startsWith('--')) {
      continue;
    }
    positional.push(argv[i]);
  }
  return positional;
}

function hasFlag(name) {
  return process.argv.includes(name);
}

function isTruthyEnv(name, defaultValue = true) {
  const value = process.env[name];
  if (value === undefined) {
    return defaultValue;
  }
  return !['0', 'false', 'no', 'off'].includes(String(value).toLowerCase());
}

function isTempoReady() {
  try {
    execSync(
      'node -e "require(\'http\').get(\'http://127.0.0.1:3200/ready\', (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on(\'error\', () => process.exit(1))"',
      { stdio: 'ignore', timeout: 3000 },
    );
    return true;
  } catch {
    return false;
  }
}

const scenario = getPositionalArgs(process.argv)[0] || 'smoke';
const tracesRequested = !hasFlag('--without-traces') && isTruthyEnv('K6_WITH_TRACES', true);
const tempoReady = tracesRequested ? isTempoReady() : false;
const withTraces = tracesRequested && tempoReady;

if (tracesRequested && !tempoReady) {
  console.warn('[WARN] Tempo indisponível em http://localhost:3200 — K6 executará sem export OTLP.');
}

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

function buildK6Env(scenarioKey) {
  const env = {
    ...process.env,
    K6_SCENARIO: scenarioKey,
  };

  if (withTraces) {
    env.K6_OTEL_GRPC_EXPORTER_INSECURE = 'true';
    env.K6_OTEL_GRPC_EXPORTER_ENDPOINT = process.env.K6_OTEL_ENDPOINT || 'localhost:4317';
    env.K6_OTEL_SERVICE_NAME = 'k6-load-test';
    env.K6_OTEL_METRIC_PREFIX = 'k6.';
  }

  return env;
}

function buildK6Command(k6SummaryPath, script) {
  const parts = [`${k6Binary} run`, `--summary-export "${k6SummaryPath}"`];
  if (withTraces) {
    parts.push('--out opentelemetry');
  }
  parts.push(`"${script}"`);
  return parts.join(' ');
}

function runScenario(key) {
  const script = path.join(root, scenarios[key]);
  const k6SummaryPath = path.join(resultsDir, `k6-${key}.json`);

  console.log(`\n=== K6: ${key}${withTraces ? ' (traces → Tempo)' : ''} ===`);
  const scenarioStartedAt = Date.now();

  try {
    execSync(buildK6Command(k6SummaryPath, script), {
      cwd: root,
      stdio: 'inherit',
      env: buildK6Env(key),
    });
    const stats = parseK6Summary(k6SummaryPath);
    scenarioResults.push({
      name: key,
      status: 'passed',
      durationMs: Date.now() - scenarioStartedAt,
      tracesEnabled: withTraces,
      ...stats,
    });
  } catch {
    failed = true;
    const stats = parseK6Summary(k6SummaryPath);
    scenarioResults.push({
      name: key,
      status: 'failed',
      durationMs: Date.now() - scenarioStartedAt,
      tracesEnabled: withTraces,
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
  tracesEnabled: withTraces,
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
