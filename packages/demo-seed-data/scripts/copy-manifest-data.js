const fs = require('fs');
const path = require('path');

const packageRoot = path.resolve(__dirname, '..');

const sourceDataDir = path.join(packageRoot, 'src', 'manifest', 'data');
const targetDataDir = path.join(packageRoot, 'dist', 'manifest', 'data');

fs.mkdirSync(targetDataDir, { recursive: true });

for (const fileName of fs.readdirSync(sourceDataDir)) {
	const sourcePath = path.join(sourceDataDir, fileName);
	if (!fs.statSync(sourcePath).isFile()) continue;
	fs.copyFileSync(sourcePath, path.join(targetDataDir, fileName));
}

console.log('[demo-seed-data] JSON manifests copied to dist/manifest/data');

const sourceAssetsDir = path.join(packageRoot, 'assets', 'cargo-images');
const targetAssetsDir = path.join(packageRoot, 'dist', 'assets', 'cargo-images');

if (fs.existsSync(sourceAssetsDir)) {
	fs.mkdirSync(targetAssetsDir, { recursive: true });

	for (const fileName of fs.readdirSync(sourceAssetsDir)) {
		const sourcePath = path.join(sourceAssetsDir, fileName);
		if (!fs.statSync(sourcePath).isFile()) continue;
		fs.copyFileSync(sourcePath, path.join(targetAssetsDir, fileName));
	}

	console.log('[demo-seed-data] Cargo image assets copied to dist/assets/cargo-images');
} else {
	console.log('[demo-seed-data] No cargo image assets to copy (assets/cargo-images missing)');
}
