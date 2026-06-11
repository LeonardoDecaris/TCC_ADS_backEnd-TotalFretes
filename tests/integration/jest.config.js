const path = require('path');

/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/flows/**/*.test.ts'],
  testTimeout: 60000,
  globalSetup: path.join(__dirname, 'setup/globalSetup.ts'),
  setupFiles: [path.join(__dirname, 'setup/env.ts')],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: path.join(__dirname, 'tsconfig.json') }],
  },
};
