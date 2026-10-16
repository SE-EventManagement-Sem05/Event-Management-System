const { spawnSync } = require('child_process');
const path = require('path');

const SCRIPT = path.join(__dirname, 'dbTool.js');
const BACKEND_DIR = path.join(__dirname, '..', '..');

// Runs one dbTool command against the test database and returns its JSON result.
function runDbTool(mongoUri, command, payload = null) {
  const result = spawnSync(process.execPath, [SCRIPT, command], {
    cwd: BACKEND_DIR,
    input: JSON.stringify(payload),
    env: { ...process.env, MONGODB_URI: mongoUri },
    encoding: 'utf8',
    timeout: 90000,
  });

  if (result.error || result.status !== 0) {
    const reason = (result.error && result.error.message) || result.stderr || result.stdout;

    throw new Error(`The database helper "${command}" failed: ${String(reason).trim()}`);
  }

  const lastLine = result.stdout.trim().split('\n').pop();

  return JSON.parse(lastLine);
}

module.exports = { runDbTool };