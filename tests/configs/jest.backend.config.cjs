const path = require('path');

const projectRoot = path.resolve(__dirname, '..', '..');

module.exports = {
  rootDir: projectRoot,
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/backend/tests/setupEnv.js'],
  testMatch: ['<rootDir>/tests/backend/**/*.test.js'],
  moduleDirectories: [
    'node_modules',
    '<rootDir>/backend/node_modules',
  ],
  // Map relative paths coming from tests/backend/ to the correct backend directory
  moduleNameMapper: {
    '^\\.\\./\\.\\./\\.\\./backend/(.*)$': '<rootDir>/backend/$1',
  },
  collectCoverageFrom: [
    'backend/**/*.js',
    '!backend/node_modules/**',
    '!backend/tests/**',
    '!backend/scripts/**',
    '!backend/coverage/**',
    '!backend/test-results/**',
  ],
  coverageDirectory: '<rootDir>/tests/reports/coverage-backend-temp',
  coverageReporters: ['text', 'html', 'lcov', 'json-summary', 'text-summary'],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
};  