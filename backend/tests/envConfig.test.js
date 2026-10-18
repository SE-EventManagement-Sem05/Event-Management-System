const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

describe('EMS-NFR-05: .env configuration', () => {
  test('loads PORT, MONGODB_URI, SQLITE_PATH and JWT_SECRET from .env', () => {
    const tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'ems-nfr05-')
    );

    const sqlitePath = path.join(tempDir, 'test-auth.sqlite');
    const mongoUri = 'mongodb://127.0.0.1:27017/ems_env_test';

    fs.writeFileSync(
      path.join(tempDir, '.env'),
      [
        'PORT=6123',
        `MONGODB_URI=${mongoUri}`,
        `SQLITE_PATH=${sqlitePath}`,
        'JWT_SECRET=nfr05-test-secret',
        'JWT_EXPIRES_IN=45m',
        '',
      ].join('\n')
    );

    const script = `
      const assert = require('assert');
      const path = require('path');

      const backend = ${JSON.stringify(
        path.resolve(__dirname, '..')
      )};

      require(path.join(backend, 'server'));

      assert.strictEqual(process.env.PORT, '6123');
      assert.strictEqual(
        process.env.MONGODB_URI,
        ${JSON.stringify(mongoUri)}
      );
      assert.strictEqual(
        process.env.SQLITE_PATH,
        ${JSON.stringify(sqlitePath)}
      );
      assert.strictEqual(
        process.env.JWT_SECRET,
        'nfr05-test-secret'
      );

      console.log('NFR05_ENV_TEST_PASSED');
    `;

    const env = { ...process.env };

    [
      'PORT',
      'MONGODB_URI',
      'SQLITE_PATH',
      'JWT_SECRET',
      'JWT_EXPIRES_IN',
      'DOTENV_CONFIG_PATH',
    ].forEach((key) => delete env[key]);

    try {
      const result = spawnSync(process.execPath, ['-e', script], {
        cwd: tempDir,
        env,
        encoding: 'utf8',
        timeout: 15000,
      });

      expect(result.status).toBe(0);
      expect(result.stdout).toContain('NFR05_ENV_TEST_PASSED');
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});