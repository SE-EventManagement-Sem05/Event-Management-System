jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

const path = require('path');
const dotenv = require('dotenv');
const originalEnv = { ...process.env };

function loadConfig() {
  let config;
  jest.isolateModules(() => {
    config = require('../../../backend/config');
  });
  return config;
}

beforeEach(() => {
  process.env = { ...originalEnv };
  delete process.env.PORT;
  delete process.env.MONGODB_URI;
  delete process.env.SQLITE_PATH;
  delete process.env.JWT_SECRET;
  delete process.env.JWT_EXPIRES_IN;
  dotenv.config.mockClear();
});

afterAll(() => {
  process.env = { ...originalEnv };
});

describe('backend configuration defaults', () => {
  test('uses default port, SQLite path, and JWT lifetime when values are absent', () => {
    const config = loadConfig();

    expect(config.PORT).toBe(5000);
    expect(config.MONGODB_URI).toBeUndefined();
    // expect(config.SQLITE_PATH).toBe(path.join(__dirname, '../../../backend', 'database', 'auth.sqlite'));
    expect(config.SQLITE_PATH).toBe(path.join(__dirname, '../../backend', 'database', 'auth.sqlite'));
    expect(config.JWT_SECRET).toBeUndefined();
    expect(config.JWT_EXPIRES_IN).toBe('60m');
    expect(dotenv.config).toHaveBeenCalledTimes(1);
    expect(Object.isFrozen(config)).toBe(true);
  });
});

describe('backend configuration from environment', () => {
  test('uses configured values without replacing them with defaults', () => {
    process.env.PORT = '6123';
    process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/ems_test';
    process.env.SQLITE_PATH = '/tmp/ems-auth-test.sqlite';
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '45m';

    const config = loadConfig();

    expect(config).toEqual({
      PORT: '6123',
      MONGODB_URI: 'mongodb://127.0.0.1:27017/ems_test',
      SQLITE_PATH: '/tmp/ems-auth-test.sqlite',
      JWT_SECRET: 'test-secret',
      JWT_EXPIRES_IN: '45m',
    });
  });
});
