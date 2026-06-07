const path = require('path');
const base = require('../packages/test-utils/jest/base.config');

module.exports = {
  ...base,
  rootDir: '.',
  setupFiles: [path.join(__dirname, 'test/setup/env.ts')],
  setupFilesAfterEnv: [path.join(__dirname, '../packages/test-utils/jest/setup.ts')],
};
