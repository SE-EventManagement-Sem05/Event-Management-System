import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const configDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(configDir, '..', '..');
const frontendDir = path.join(projectRoot, 'frontend');
const frontendModules = path.join(frontendDir, 'node_modules');

const require = createRequire(import.meta.url);
const { defineConfig } = require(path.join(frontendModules, 'vite'));
const reactPlugin = require(path.join(frontendModules, '@vitejs/plugin-react'));
const react = reactPlugin.default || reactPlugin;

export default defineConfig({
  plugins: [typeof react === 'function' ? react() : react()],
  root: frontendDir,
  resolve: {
    alias: [
      // Target only source file imports pointing to frontend/src/
      { find: /^.*\/frontend\/src\/(.*)$/, replacement: path.join(frontendDir, 'src', '$1') },
      { find: '@testing-library/react', replacement: path.join(frontendModules, '@testing-library/react') },
      { find: '@testing-library/user-event', replacement: path.join(frontendModules, '@testing-library/user-event') },
      { find: 'react-router-dom', replacement: path.join(frontendModules, 'react-router-dom') },
      { find: 'react-dom', replacement: path.join(frontendModules, 'react-dom') },
      { find: 'react', replacement: path.join(frontendModules, 'react') },
    ],
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:5000' },
    fs: { allow: [projectRoot] },
  },
  build: { target: 'es2020' },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: path.join(frontendDir, 'src/test/setup.js'),
    include: ['../tests/frontend/**/*.test.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reportsDirectory: path.join(projectRoot, 'tests/reports/coverage-frontend-temp'),
      reporter: ['text', 'html', 'lcov', 'json-summary', 'text-summary'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/**/*.test.{js,jsx}', 'src/test/**'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});