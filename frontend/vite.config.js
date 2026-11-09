import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const frontendDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(frontendDir, '..');
const frontendModules = path.join(frontendDir, 'node_modules');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
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
    include: ['../verification/tests/frontend/**/*.test.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reportsDirectory: path.join(projectRoot, 'verification/reports/frontend/coverage'),
      reporter: ['text', 'html', 'lcov', 'json-summary'],
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
