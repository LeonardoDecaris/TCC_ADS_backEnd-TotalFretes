/**
 * Executa a suite completa em sequência:
 * 1. Testes unitários (8 microserviços)
 * 2. Testes de integração (sobe Docker + override de teste, salvo --skip-stack)
 * 3. Testes de carga K6 (todos os cenários, salvo --skip-load)
 *
 * Uso:
 *   node scripts/test-all.js
 *   node scripts/test-all.js --skip-stack    # integração sem subir Docker
 *   node scripts/test-all.js --skip-load     # pula K6 (ex.: k6 não instalado)
 *   node scripts/test-all.js --teardown      # derruba stack ao final
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const {
  getResultsDir,
  printSuiteSummary,
  readSummaryFile,
} = require('./lib/test-summary');

const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const skipStack = args.includes('--skip-stack');
const skipLoad = args.includes('--skip-load');
const teardown = args.includes('--teardown');
const resultsDir = getResultsDir(root);
fs.mkdirSync(resultsDir, { recursive: true });

const phases = [
  {
    key: 'unit',
    name: 'Unitários',
    script: 'test-unit-all.js',
    summaryPath: path.join(resultsDir, 'unit-summary.json'),
    extraArgs: [],
  },
  {
    key: 'integration',
    name: 'Integração',
    script: 'test-integration.js',
    summaryPath: path.join(resultsDir, 'integration-summary.json'),
    extraArgs: skipStack ? ['--skip-stack'] : [],
  },
];

if (!skipLoad) {
  phases.push({
    key: 'load',
    name: 'Carga (K6)',
    script: 'test-load.js',
    summaryPath: path.join(resultsDir, 'load-summary.json'),
    extraArgs: ['all'],
  });
}

const startedAt = Date.now();
let failedPhase = null;
const collectedPhases = [];

for (const phase of phases) {
  const label = `Fase: ${phase.name}`;
  console.log(`\n${'='.repeat(60)}\n${label}\n${'='.repeat(60)}\n`);

  try {
    const scriptPath = path.join(__dirname, phase.script);
    const cmd = [
      'node',
      `"${scriptPath}"`,
      '--summary-file',
      `"${phase.summaryPath}"`,
      ...(phase.extraArgs ?? []),
    ].join(' ');
    execSync(cmd, { cwd: root, stdio: 'inherit', shell: true });

    const summary = readSummaryFile(phase.summaryPath);
    if (summary) collectedPhases.push(summary);
  } catch {
    failedPhase = phase.name;
    const summary = readSummaryFile(phase.summaryPath);
    if (summary) collectedPhases.push(summary);
    break;
  }
}

if (skipLoad) {
  collectedPhases.push({
    skipped: true,
    title: 'CARGA (K6)',
    note: 'Pulado (--skip-load)',
  });
}

if (teardown && !skipStack) {
  console.log('\n=== Derrubando stack de teste ===');
  try {
    execSync('npm run test:integration:down', { cwd: root, stdio: 'inherit' });
  } catch {
    console.error('[WARN] Falha ao derrubar stack (pode já estar parado).');
  }
}

const elapsedMs = Date.now() - startedAt;

printSuiteSummary({
  phases: collectedPhases,
  totalDurationMs: elapsedMs,
  overallStatus: failedPhase ? 'failed' : 'passed',
  failedPhase,
});

if (failedPhase) {
  process.exit(1);
}
