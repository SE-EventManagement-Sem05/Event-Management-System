#!/usr/bin/env node
'use strict';

/**
 * Configurable, dependency-free API concurrency/performance test.
 * Requires Node.js 18+ (global fetch and AbortSignal.timeout).
 * Run only against a local/test/staging environment you are authorised to test.
 *
 * Required: API_URL
 * Optional: API_METHOD, API_BODY_JSON, API_HEADERS_JSON, API_EXPECTED_STATUSES,
 *           WARMUP_REQUESTS, MEASURED_REQUESTS, CONCURRENCY,
 *           REQUEST_TIMEOUT_MS
 */

import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';

function positiveInt(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive integer`);
  }
  return value;
}

function parseJsonEnv(name, fallback) {
  const raw = process.env[name];
  if (!raw) return fallback;
  try { return JSON.parse(raw); }
  catch { throw new Error(`${name} must contain valid JSON`); }
}

function percentile(sorted, p) {
  if (!sorted.length) return null;
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
}

async function requestOnce(config) {
  const started = performance.now();
  try {
    const response = await fetch(config.url, {
      method: config.method,
      headers: config.headers,
      body: config.body,
      signal: AbortSignal.timeout(config.timeoutMs),
    });

    // Consume the body so measurement includes response transfer completion.
    await response.arrayBuffer();

    return {
      elapsedMs: Number((performance.now() - started).toFixed(2)),
      status: response.status,
      error: null,
    };
  } catch (error) {
    return {
      elapsedMs: Number((performance.now() - started).toFixed(2)),
      status: null,
      error: error.name === 'TimeoutError' ? 'timeout' : error.message,
    };
  }
}

async function main() {
  const url = process.env.API_URL;
  if (!url) throw new Error('Set API_URL to the endpoint being tested');

  const method = (process.env.API_METHOD || 'GET').toUpperCase();
  const headers = parseJsonEnv('API_HEADERS_JSON', {});
  const bodyObject = parseJsonEnv('API_BODY_JSON', null);

  if (bodyObject !== null &&
      !headers['Content-Type'] &&
      !headers['content-type']) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    url,
    method,
    headers,
    body: bodyObject === null ? undefined : JSON.stringify(bodyObject),
    timeoutMs: positiveInt('REQUEST_TIMEOUT_MS', 10000),
  };

  const warmups = positiveInt('WARMUP_REQUESTS', 5);
  const measured = positiveInt('MEASURED_REQUESTS', 100);
  const concurrency = positiveInt('CONCURRENCY', 5);

  const expectedStatusesRaw = process.env.API_EXPECTED_STATUSES;
  const expectedStatuses = expectedStatusesRaw
    ? new Set(expectedStatusesRaw.split(',').map((x) => Number(x.trim())))
    : null;

  console.log(`Warm-up: ${warmups} sequential requests`);

  for (let i = 0; i < warmups; i += 1) {
    const result = await requestOnce(config);
    console.log(`  warm-up ${i + 1}: ${result.status ?? result.error}`);
  }

  console.log(`Measured: ${measured} requests, concurrency=${concurrency}`);

  const results = new Array(measured);
  let next = 0;

  async function worker() {
    while (true) {
      const index = next;
      next += 1;

      if (index >= measured) return;
      results[index] = await requestOnce(config);
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(concurrency, measured) },
      worker
    )
  );

  const successfulHttp = results.filter((r) => r.status !== null);
  const times = successfulHttp
    .map((r) => r.elapsedMs)
    .sort((a, b) => a - b);

  const statusCounts = {};

  for (const result of results) {
    const key = result.status === null
      ? 'NETWORK_ERROR'
      : String(result.status);

    statusCounts[key] = (statusCounts[key] || 0) + 1;
  }

  const errors = results.filter((r) => r.error !== null);
  const p95 = percentile(times, 95);

  const report = {
    generatedAt: new Date().toISOString(),

    environment:
      process.env.TEST_ENVIRONMENT ||
      'unspecified (set TEST_ENVIRONMENT)',

    request: {
      url,
      method,
      warmupRequestsExcluded: warmups,
      measuredRequests: measured,
      concurrency,
      timeoutMs: config.timeoutMs,
      expectedStatuses: expectedStatuses
        ? [...expectedStatuses]
        : null,
    },

    metricsMs: {
      min: times.length ? times[0] : null,

      average: times.length
        ? Number((
            times.reduce((sum, value) => sum + value, 0) /
            times.length
          ).toFixed(2))
        : null,

      median: percentile(times, 50),
      p95,
      p99: percentile(times, 99),
      max: times.length ? times[times.length - 1] : null,
    },

    statusCounts,
    networkOrTimeoutErrors: errors.length,

    limitations: [
      'This is a controlled test run, not proof of production capacity.',
      'Results depend on the machine, network, database state, and server configuration.',
      'Only the configured endpoint, method, payload, and concurrency were measured.',
    ],
  };

  const outputDir = path.join(
    process.cwd(),
    'performance'
  );

  fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(
    outputDir,
    'api-load-report.json'
  );

  fs.writeFileSync(
    outputPath,
    `${JSON.stringify(report, null, 2)}\n`
  );

  console.log('\nRESULT');
  console.log(JSON.stringify(report, null, 2));
  console.log(`\nSaved: ${outputPath}`);
}

main().catch((error) => {
  console.error(
    `API load test could not run: ${error.message}`
  );
  process.exitCode = 2;
});
