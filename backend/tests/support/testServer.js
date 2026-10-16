const { spawn } = require('child_process');
const net = require('net');
const path = require('path');

const BACKEND_DIR = path.join(__dirname, '..', '..');

function getFreePort() {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();

    probe.on('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });
}

function stopChild(child) {
  return new Promise((resolve) => {
    if (child.exitCode !== null || child.signalCode !== null) {
      resolve();
      return;
    }

    const forceKill = setTimeout(() => child.kill('SIGKILL'), 5000);

    child.once('exit', () => {
      clearTimeout(forceKill);
      resolve();
    });
    child.kill('SIGTERM');
  });
}

// Starts the real application (node server.js) in its own process, exactly as it
// runs outside the tests, connected to the given MongoDB. Resolves when the server
// is listening and MongoDB is connected.
async function startTestServer({
  mongoUri,
  entry = 'server.js',
  cwd = BACKEND_DIR,
  readyTimeoutMs = 60000,
}) {
  const port = await getFreePort();
  let output = '';

  const child = spawn(process.execPath, [entry], {
    cwd,
    env: {
      ...process.env,
      NODE_ENV: 'test',
      PORT: String(port),
      MONGODB_URI: mongoUri,
      JWT_SECRET: 'test-secret',
      JWT_EXPIRES_IN: '60m',
      SQLITE_PATH: ':memory:',
      DOTENV_CONFIG_QUIET: 'true',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const ready = new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(
        new Error(
          `The test server was not ready after ${readyTimeoutMs / 1000} seconds. Server output:\n${output}`
        )
      );
    }, readyTimeoutMs);

    const collect = (chunk) => {
      output += chunk.toString();

      if (output.includes('Backend running') && output.includes('MongoDB connected')) {
        clearTimeout(timer);
        resolve();
      }
    };

    child.stdout.on('data', collect);
    child.stderr.on('data', collect);
    child.once('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.once('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`The test server stopped early (exit code ${code}). Server output:\n${output}`));
    });
  });

  try {
    await ready;
  } catch (error) {
    await stopChild(child);
    throw error;
  }

  return {
    baseUrl: `http://127.0.0.1:${port}`,
    getOutput: () => output,
    stop: () => stopChild(child),
  };
}

module.exports = { startTestServer };