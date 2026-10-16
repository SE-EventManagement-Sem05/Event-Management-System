const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const DEFAULT_TEST_DATABASE = 'ems_test';

// Replaces the database name in a MongoDB connection string and keeps the
// host, credentials and options (works for mongodb:// and mongodb+srv://).
function withDatabase(uri, databaseName) {
  const match = /^(mongodb(?:\+srv)?:\/\/[^/?]+)(\/[^?]*)?(\?.*)?$/.exec(uri);

  if (!match) {
    throw new Error('MONGODB_URI is not a valid MongoDB connection string.');
  }

  return `${match[1]}/${databaseName}${match[3] || ''}`;
}

function databaseNameOf(uri) {
  const match = /^mongodb(?:\+srv)?:\/\/[^/?]+\/([^?]*)/.exec(uri);

  return match ? decodeURIComponent(match[1]) : '';
}

// The tests use the same MongoDB server as the real application (MONGODB_URI in
// backend/.env) but always a separate database, so development data is never touched.
// Set TEST_MONGODB_URI to use a different server; its database name must end in _test.
function resolveTestMongoUri(envFile = path.join(__dirname, '..', '..', '.env')) {
  let uri;

  if (process.env.TEST_MONGODB_URI) {
    uri = process.env.TEST_MONGODB_URI;
  } else {
    const parsed = fs.existsSync(envFile) ? dotenv.parse(fs.readFileSync(envFile)) : {};

    if (!parsed.MONGODB_URI) {
      throw new Error(
        'MONGODB_URI is not set in backend/.env. The tests use the same MongoDB server as the application ' +
          '(with a separate "ems_test" database), or set TEST_MONGODB_URI.'
      );
    }

    uri = withDatabase(parsed.MONGODB_URI, process.env.TEST_DB_NAME || DEFAULT_TEST_DATABASE);
  }

  const databaseName = databaseNameOf(uri);

  if (!databaseName.endsWith('_test')) {
    throw new Error(
      `Refusing to run the tests on database "${databaseName}": the test database name must end in _test.`
    );
  }

  return uri;
}

module.exports = { resolveTestMongoUri, withDatabase, databaseNameOf };