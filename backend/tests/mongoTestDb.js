const mongoose = require('mongoose');

// Newer MongoDB servers can reject the handshake of some driver versions, so
// the in-memory server is tried with each of these releases in turn.
// Set MONGOMS_VERSION to try exactly one version instead.
const DEFAULT_VERSIONS = ['7.0.14', '8.0.4'];

let memoryServer = null;

// By default the tests run against a throwaway in-memory MongoDB, so no database
// needs to be running. To use a real server instead, set TEST_MONGODB_URI to its
// address, or set USE_REAL_MONGO=true to use mongodb://127.0.0.1:27017/ems_test.
function shouldUseRealMongo() {
  return Boolean(process.env.TEST_MONGODB_URI) || process.env.USE_REAL_MONGO === 'true';
}

function versionsToTry() {
  return process.env.MONGOMS_VERSION ? [process.env.MONGOMS_VERSION] : DEFAULT_VERSIONS;
}

async function stopMemoryServer() {
  if (memoryServer) {
    await memoryServer.stop().catch(() => {});
    memoryServer = null;
  }
}

async function connectToMemoryServer() {
  let MongoMemoryServer;

  try {
    ({ MongoMemoryServer } = require('mongodb-memory-server'));
  } catch {
    throw new Error(
      'mongodb-memory-server is not installed. Run "npm install --save-dev mongodb-memory-server" ' +
        'in the backend folder, or set TEST_MONGODB_URI to use a real MongoDB.'
    );
  }

  const failures = [];

  for (const version of versionsToTry()) {
    try {
      memoryServer = await MongoMemoryServer.create({ binary: { version } });

      const uri = memoryServer.getUri('ems_test');
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });

      // Tests that reconnect after a simulated outage read this value too.
      process.env.MONGODB_URI = uri;
      return;
    } catch (error) {
      failures.push(`MongoDB ${version}: ${error.message}`);

      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect().catch(() => {});
      }
      await stopMemoryServer();
    }
  }

  throw new Error(
    `No in-memory MongoDB could be used (mongoose ${mongoose.version}, Node ${process.version}).\n- ` +
      failures.join('\n- ')
  );
}

async function connectTestDb() {
  if (!shouldUseRealMongo()) {
    await connectToMemoryServer();
    return;
  }

  const uri = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/ems_test';

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    process.env.MONGODB_URI = uri;
  } catch (error) {
    throw new Error(`Cannot reach MongoDB at ${uri}. Original error: ${error.message}`);
  }
}

async function disconnectTestDb() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await stopMemoryServer();
}

module.exports = { connectTestDb, disconnectTestDb };