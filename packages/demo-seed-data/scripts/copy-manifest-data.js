const fs = require('fs');
const path = require('path');

const sourceDir = path.resolve(__dirname, '..', 'src', 'manifest', 'data');
const targetDir = path.resolve(__dirname, '..', 'dist', 'manifest', 'data');

fs.mkdirSync(targetDir, { recursive: true });

for (const fileName of fs.readdirSync(sourceDir)) {
	const sourcePath = path.join(sourceDir, fileName);
	const targetPath = path.join(targetDir, fileName);
	fs.copyFileSync(sourcePath, targetPath);
}

console.log('[demo-seed-data] JSON manifests copied to dist/manifest/data');
