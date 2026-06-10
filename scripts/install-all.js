/**
 * Instala dependências npm na raiz, pacotes compartilhados e microserviços.
 *
 * Ordem: pacotes internos primeiro (rpc-contracts → logging → tracing → test-utils),
 * depois os microserviços e tests/integration.
 *
 * Uso:
 *   node scripts/install-all.js
 *   npm run install:all
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const targets = [
  { label: 'raiz', dir: '.' },
  { label: 'packages/rpc-contracts', dir: 'packages/rpc-contracts' },
  { label: 'packages/logging', dir: 'packages/logging' },
  { label: 'packages/tracing', dir: 'packages/tracing' },
  { label: 'packages/test-utils', dir: 'packages/test-utils' },
  { label: 'authentication-service', dir: 'authentication-service' },
  { label: 'user-service', dir: 'user-service' },
  { label: 'company-service', dir: 'company-service' },
  { label: 'freight-service', dir: 'freight-service' },
  { label: 'storage-service', dir: 'storage-service' },
  { label: 'mapbox-service', dir: 'mapbox-service' },
  { label: 'email-management-service', dir: 'email-management-service' },
  { label: 'notification-service', dir: 'notification-service' },
  { label: 'swagger-service', dir: 'swagger-service' },
  { label: 'tests/integration', dir: 'tests/integration' },
];

const startedAt = Date.now();
const results = [];
let failed = false;

console.log(`\n${'='.repeat(60)}\nInstalando dependências (${targets.length} destinos)\n${'='.repeat(60)}\n`);

for (const target of targets) {
  const cwd = path.join(root, target.dir);
  const pkgPath = path.join(cwd, 'package.json');

  if (!fs.existsSync(pkgPath)) {
    console.warn(`[SKIP] ${target.label} — package.json não encontrado`);
    results.push({ name: target.label, status: 'skipped' });
    continue;
  }

  console.log(`\n=== npm install: ${target.label} ===`);

  try {
    execSync('npm install', { cwd, stdio: 'inherit' });
    results.push({ name: target.label, status: 'ok' });
  } catch {
    failed = true;
    results.push({ name: target.label, status: 'failed' });
    console.error(`[FAIL] ${target.label}`);
    break;
  }
}

const elapsedSec = Math.round((Date.now() - startedAt) / 1000);
const ok = results.filter((r) => r.status === 'ok').length;
const skipped = results.filter((r) => r.status === 'skipped').length;

console.log(`\n${'='.repeat(60)}`);
console.log(failed ? '  Instalação interrompida por falha' : '  Instalação concluída');
console.log(`  ${ok} ok · ${skipped} ignorado(s) · ${elapsedSec}s`);
console.log(`${'='.repeat(60)}\n`);

if (failed) {
  process.exit(1);
}
