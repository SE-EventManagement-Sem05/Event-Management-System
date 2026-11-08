const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const DEFAULT_TEST_DATABASE = 'ems_test';

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

function resolveTestMongoUri(
  envFile = path.join(__dirname, '..', '..', '.env'),
  databaseName
) {
  let uri;

  let selectedDatabase;

  if (process.env.TEST_MONGODB_URI) {
    uri = process.env.TEST_MONGODB_URI;
    selectedDatabase =
      databaseName ||
      process.env.TEST_DB_NAME ||
      databaseNameOf(uri) ||
      DEFAULT_TEST_DATABASE;
  } else {
    const parsed = fs.existsSync(envFile)
      ? dotenv.parse(fs.readFileSync(envFile))
      : {};

    if (!parsed.MONGODB_URI) {
      throw new Error(
        'MONGODB_URI is not set in backend/.env. The tests use the same MongoDB server as the application ' +
          '(with a separate test database), or set TEST_MONGODB_URI.'
      );
    }

    uri = parsed.MONGODB_URI;
    selectedDatabase =
      databaseName || process.env.TEST_DB_NAME || DEFAULT_TEST_DATABASE;
  }

  uri = withDatabase(uri, selectedDatabase);

  const resolvedName = databaseNameOf(uri);

  if (!resolvedName.endsWith('_test')) {
    throw new Error(
      `Refusing to run the tests on database "${resolvedName}": the test database name must end in _test.`
    );
  }

  return uri;
}

module.exports = { resolveTestMongoUri, withDatabase, databaseNameOf };
