// Runs before every test file. Forces a safe, isolated configuration so the
// tests can never touch the development SQLite file or the development MongoDB.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '60m';
process.env.SQLITE_PATH = ':memory:';
process.env.MONGODB_URI =
  process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/ems_test';
process.env.DOTENV_CONFIG_QUIET = 'true';