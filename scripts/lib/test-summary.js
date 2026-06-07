const fs = require('fs');
const path = require('path');

const WIDTH = 64;

const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
  bgYellow: '\x1b[43m',
};

function supportsColor() {
  if (process.env.NO_COLOR !== undefined) return false;
  if (process.env.FORCE_COLOR === '0' || process.env.FORCE_COLOR === 'false') return false;
  if (process.env.FORCE_COLOR === '1' || process.env.FORCE_COLOR === 'true') return true;
  return Boolean(process.stdout.isTTY);
}

const useColor = supportsColor();

function paint(style, text) {
  if (!useColor || !style) return String(text);
  return `${style}${text}${ANSI.reset}`;
}

function stripAnsi(text) {
  return String(text).replace(/\x1b\[[0-9;]*m/g, '');
}

function formatDuration(ms) {
  if (!ms || ms < 0) return '—';
  const totalSec = Math.round(ms / 1000);
  if (totalSec < 60) return `${totalSec}s`;
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return sec > 0 ? `${min}m ${sec}s` : `${min}m`;
}

function statusIcon(ok) {
  return ok ? '✅' : '❌';
}

function statusLabel(ok) {
  const label = ok ? 'OK' : 'FALHOU';
  return paint(ok ? ANSI.green : ANSI.red, label);
}

function statusTag(ok) {
  const tag = ok ? ' PASS ' : ' FAIL ';
  const bg = ok ? ANSI.bgGreen : ANSI.bgRed;
  return paint(`${ANSI.bold}${bg}${ANSI.white}`, tag);
}

function phaseEmoji(type) {
  if (type === 'unit') return '🧪';
  if (type === 'integration') return '🔗';
  if (type === 'load') return '⚡';
  return '📋';
}

function padRight(text, len) {
  const visible = stripAnsi(text).length;
  if (visible >= len) return text;
  return text + ' '.repeat(len - visible);
}

function line(char = '─', color = ANSI.dim) {
  return paint(color, char.repeat(WIDTH));
}

function parseJestReport(reportPath) {
  if (!reportPath || !fs.existsSync(reportPath)) {
    return {
      suites: 0,
      tests: 0,
      passed: 0,
      failed: 0,
      durationMs: 0,
      failedTests: [],
    };
  }

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const failedTests = [];

  for (const suite of report.testResults ?? []) {
    for (const assertion of suite.assertionResults ?? []) {
      if (assertion.status === 'failed') {
        failedTests.push({
          suite: path.basename(suite.name),
          test: assertion.title,
        });
      }
    }
  }

  return {
    suites: report.numTotalTestSuites ?? 0,
    tests: report.numTotalTests ?? 0,
    passed: report.numPassedTests ?? 0,
    failed: report.numFailedTests ?? 0,
    durationMs: Math.max(0, (report.endTime ?? 0) - (report.startTime ?? 0)),
    failedTests,
  };
}

function parseK6Summary(summaryPath) {
  if (!summaryPath || !fs.existsSync(summaryPath)) {
    return { checksPassed: 0, checksFailed: 0, httpReqs: 0 };
  }

  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
  const checks = summary.metrics?.checks?.values ?? {};

  return {
    checksPassed: checks.passes ?? 0,
    checksFailed: checks.fails ?? 0,
    httpReqs: summary.metrics?.http_reqs?.values?.count ?? 0,
  };
}

function readSummaryFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeSummaryFile(filePath, data) {
  if (!filePath) return;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function getSummaryFileArg(argv = process.argv) {
  const idx = argv.indexOf('--summary-file');
  return idx >= 0 ? argv[idx + 1] : null;
}

function getResultsDir(root) {
  return path.join(root, '.test-results');
}

function printFailLines(failedTests, limit = 3) {
  if (!failedTests?.length) return;
  for (const fail of failedTests.slice(0, limit)) {
    console.log(
      paint(ANSI.red, `      ✗ ${fail.suite} › ${fail.test}`),
    );
  }
  if (failedTests.length > limit) {
    console.log(paint(ANSI.dim, `      … +${failedTests.length - limit} falha(s)`));
  }
}

function printPhaseBlock(title, phase) {
  const ok = phase.status === 'passed';
  const emoji = phaseEmoji(phase.type);
  const duration = paint(ANSI.cyan, `⏱ ${formatDuration(phase.durationMs)}`);
  const titleText = paint(ANSI.bold, `${emoji} ${title}`);
  const headerLine = `  ${padRight(titleText, WIDTH - 12)} ${statusTag(ok)} ${duration}`;

  console.log(line('─', ANSI.blue));
  console.log(headerLine);
  console.log(line('─', ANSI.blue));

  if (phase.type === 'unit' && Array.isArray(phase.services)) {
    for (const service of phase.services) {
      const serviceOk = service.status === 'passed';
      const icon = statusIcon(serviceOk);
      const counts = paint(
        serviceOk ? ANSI.green : ANSI.red,
        `${service.passed}/${service.tests} testes`,
      );
      console.log(
        `  ${icon} ${padRight(service.name, 26)} ${padRight(statusLabel(serviceOk), 14)} ${padRight(counts, 18)} ${paint(ANSI.dim, formatDuration(service.durationMs))}`,
      );
      if (!serviceOk) printFailLines(service.failedTests, 3);
    }
    const totals = phase.totals ?? {};
    console.log(
      paint(
        ANSI.dim,
        `  ♻️​  Subtotal: ${totals.tests ?? 0} testes · ${totals.passed ?? 0} ✓ · ${totals.failed ?? 0} ✗`,
      ),
    );
  }

  if (phase.type === 'integration') {
    const totals = phase.totals ?? {};
    const passed = totals.passed ?? 0;
    const total = totals.tests ?? 0;
    console.log(
      `  ${statusIcon(ok)} ${totals.suites ?? 0} suites · ${paint(ANSI.green, `${passed}/${total}`)} testes passaram`,
    );
    if (!ok) printFailLines(phase.failedTests, 5);
  }

  if (phase.type === 'load' && Array.isArray(phase.scenarios)) {
    for (const scenario of phase.scenarios) {
      const scenarioOk = scenario.status === 'passed';
      const totalChecks = scenario.checksPassed + scenario.checksFailed;
      const checks = paint(
        scenarioOk ? ANSI.green : ANSI.red,
        `checks ${scenario.checksPassed}/${totalChecks}`,
      );
      console.log(
        `  ${statusIcon(scenarioOk)} ${padRight(scenario.name, 26)} ${padRight(statusLabel(scenarioOk), 14)} ${checks}`,
      );
    }
    const totals = phase.totals ?? {};
    console.log(
      paint(
        ANSI.dim,
        `  ♻️​ Subtotal: ${totals.scenarios ?? 0} cenários · ${totals.checksPassed ?? 0} checks ✓ · ${totals.checksFailed ?? 0} ✗`,
      ),
    );
  }
}

function printSuiteSummary({ phases, totalDurationMs, overallStatus, failedPhase }) {
  const allPassed = overallStatus === 'passed';

  console.log('');
  console.log(paint(ANSI.cyan, '═'.repeat(WIDTH)));
  console.log(
    paint(ANSI.bold + ANSI.cyan, `  ✔️  RESUMO DA SUITE DE TESTES`),
  );
  console.log(paint(ANSI.cyan, '═'.repeat(WIDTH)));
  console.log('');

  const resultIcon = allPassed ? '✅' : '❌';
  const resultText = allPassed
    ? paint(ANSI.bold + ANSI.green, 'TODOS OS TESTES PASSARAM')
    : paint(ANSI.bold + ANSI.red, 'SUITE COM FALHAS');
  const failHint = failedPhase
    ? paint(ANSI.yellow, ` (parou em: ${failedPhase})`)
    : '';

  console.log(`  ${resultIcon} Resultado: ${resultText}${failHint}`);
  console.log(`  ⏱  Duração:   ${paint(ANSI.cyan, formatDuration(totalDurationMs))}`);
  console.log('');

  for (const phase of phases) {
    if (phase.skipped) {
      console.log(line('─', ANSI.yellow));
      console.log(
        `  ⏭️  ${paint(ANSI.yellow, phase.title)}${padRight('', WIDTH - stripAnsi(phase.title).length - 14)} ${paint(ANSI.bgYellow + ANSI.white, ' SKIP ')}`,
      );
      console.log(line('─', ANSI.yellow));
      if (phase.note) console.log(paint(ANSI.dim, `  ℹ️  ${phase.note}`));
      continue;
    }
    printPhaseBlock(phase.title, phase);
  }

  console.log('');
  console.log(paint(allPassed ? ANSI.green : ANSI.red, '═'.repeat(WIDTH)));

  if (allPassed) {
    const testTotal = phases
      .filter((p) => p.type === 'unit' || p.type === 'integration')
      .reduce((sum, p) => sum + (p.totals?.tests ?? 0), 0);
    const k6Total = phases
      .filter((p) => p.type === 'load')
      .reduce((sum, p) => sum + (p.totals?.scenarios ?? 0), 0);
    const k6Part = k6Total > 0 ? ` + ${k6Total} cenário(s) K6` : '';
    console.log(
      paint(
        ANSI.bold + ANSI.green,
        `  ✅ SUITE COMPLETA: ${testTotal} teste(s) automatizados${k6Part} — TUDO OK`,
      ),
    );
  } else {
    console.log(
      paint(ANSI.bold + ANSI.red, '  ⚠️ SUITE INCOMPLETA: corrija as falhas acima e execute novamente'),
    );
  }

  console.log(paint(allPassed ? ANSI.green : ANSI.red, '═'.repeat(WIDTH)));
  console.log('');
}

module.exports = {
  formatDuration,
  getResultsDir,
  getSummaryFileArg,
  parseJestReport,
  parseK6Summary,
  printSuiteSummary,
  readSummaryFile,
  writeSummaryFile,
};
