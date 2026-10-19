
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const API_URL =
  process.env.API_URL || 'http://localhost:5000/api/auth/login';

const PAGE_RUNS = Number(process.env.PAGE_RUNS || 5);
const WARMUP_REQUESTS = Number(process.env.WARMUP_REQUESTS || 5);
const API_REQUESTS = Number(process.env.API_REQUESTS || 100);
const PAGE_LIMIT_MS = 5000;
const API_P95_LIMIT_MS = 500;

const API_METHOD = (process.env.API_METHOD || 'POST').toUpperCase();
const API_TOKEN = process.env.API_TOKEN || '';
const API_BODY = process.env.API_BODY || JSON.stringify({
  role: 'attendee',
  email: 'performance-test-invalid@example.com',
  password: 'PerformanceTestInvalidPassword123!',
});

function percentile(values, p) {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.max(0, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[index];
}

function round(value) {
  return Math.round(value * 100) / 100;
}

async function measurePages() {
  const browser = await chromium.launch({ headless: true });
  const measurements = [];

  try {
    for (let run = 1; run <= PAGE_RUNS; run += 1) {
      const context = await browser.newContext();
      const page = await context.newPage();
      const start = performance.now();

      try {
        const response = await page.goto(BASE_URL, {
          waitUntil: 'load',
          timeout: 30000,
        });

        const elapsedMs = round(performance.now() - start);
        const navigation = await page.evaluate(() => {
          const entry = performance.getEntriesByType('navigation')[0];

          return {
            domContentLoadedMs: entry
              ? roundTime(entry.domContentLoadedEventEnd)
              : null,
            loadEventMs: entry ? roundTime(entry.loadEventEnd) : null,
          };

          function roundTime(value) {
            return Math.round(value * 100) / 100;
          }
        });

        measurements.push({
          run,
          elapsedMs,
          httpStatus: response?.status() ?? null,
          ...navigation,
          passed: elapsedMs <= PAGE_LIMIT_MS,
        });

        console.log(
          `Page run ${run}/${PAGE_RUNS}: ${elapsedMs} ms ` +
          `(HTTP ${response?.status() ?? 'no response'})`
        );
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }

  return {
    url: BASE_URL,
    runs: measurements,
    maxLoadMs: Math.max(...measurements.map((item) => item.elapsedMs)),
    averageLoadMs: round(
      measurements.reduce((sum, item) => sum + item.elapsedMs, 0) /
      measurements.length
    ),
    passed: measurements.every(
      (item) => item.passed && item.httpStatus >= 200 && item.httpStatus < 400
    ),
  };
}

async function requestApi() {
  const headers = {
    Accept: 'application/json',
  };

  if (API_METHOD !== 'GET' && API_METHOD !== 'HEAD') {
    headers['Content-Type'] = 'application/json';
  }

  if (API_TOKEN) {
    headers.Authorization = `Bearer ${API_TOKEN}`;
  }

  const options = { method: API_METHOD, headers };

  if (API_METHOD !== 'GET' && API_METHOD !== 'HEAD') {
    options.body = API_BODY;
  }

  const start = performance.now();
  const response = await fetch(API_URL, {
    ...options,
    signal: AbortSignal.timeout(30000),
  });
  const elapsedMs = round(performance.now() - start);

  // Consume the response body before the next request.
  await response.arrayBuffer();

  return {
    elapsedMs,
    status: response.status,
  };
}

async function measureApi() {
  for (let i = 0; i < WARMUP_REQUESTS; i += 1) {
    await requestApi();
  }

  const measurements = [];

  for (let i = 1; i <= API_REQUESTS; i += 1) {
    const result = await requestApi();

    measurements.push({
      request: i,
      responseMs: result.elapsedMs,
      httpStatus: result.status,
    });

    if (i % 10 === 0 || i === API_REQUESTS) {
      console.log(`API requests measured: ${i}/${API_REQUESTS}`);
    }
  }

  const times = measurements.map((item) => item.responseMs);
  const p95Ms = percentile(times, 95);
  const statusCounts = {};

  for (const item of measurements) {
    statusCounts[item.httpStatus] = (statusCounts[item.httpStatus] || 0) + 1;
  }

  const serverErrors = measurements.filter(
    (item) => item.httpStatus >= 500
  ).length;

  return {
    url: API_URL,
    method: API_METHOD,
    warmupRequestsExcluded: WARMUP_REQUESTS,
    measuredRequests: API_REQUESTS,
    minMs: Math.min(...times),
    averageMs: round(times.reduce((sum, value) => sum + value, 0) / times.length),
    medianMs: percentile(times, 50),
    p95Ms,
    maxMs: Math.max(...times),
    statusCounts,
    serverErrors,
    passed: p95Ms <= API_P95_LIMIT_MS && serverErrors === 0,
  };
}

function createReport(results) {
  const pageRows = results.pageLoad.runs.map((run) =>
    `| ${run.run} | ${run.elapsedMs} | ${run.httpStatus ?? 'No response'} | ` +
    `${run.passed ? 'PASS' : 'FAIL'} |`
  );

  const statusRows = Object.entries(results.api.statusCounts)
    .map(([status, count]) => `| ${status} | ${count} |`)
    .join('\n');

  return `# EMS-NFR-01 Performance Test Report

## Test environment

- Date/time: ${results.generatedAt}
- Page-load tool: Playwright (Chromium, headless)
- API measurement tool: Node.js built-in fetch and performance timer
- Page URL: ${results.pageLoad.url}
- API endpoint: ${results.api.method} ${results.api.url}
- Page-load limit: ${PAGE_LIMIT_MS} ms
- API p95 limit: ${API_P95_LIMIT_MS} ms
- Page-load runs: ${results.pageLoad.runs.length}
- API warm-up requests excluded: ${results.api.warmupRequestsExcluded}
- API measured requests: ${results.api.measuredRequests}

## Page-load results

| Run | Elapsed time (ms) | HTTP status | Result |
|---:|---:|---:|---|
${pageRows.join('\n')}

- Average measured load: ${results.pageLoad.averageLoadMs} ms
- Maximum measured load: ${results.pageLoad.maxLoadMs} ms
- Criterion: every measured page load must be at most 5,000 ms.
- Status: **${results.pageLoad.passed ? 'PASS' : 'FAIL'}**

## API response-time results

| Metric | Measured time |
|---|---:|
| Minimum | ${results.api.minMs} ms |
| Average | ${results.api.averageMs} ms |
| Median (p50) | ${results.api.medianMs} ms |
| 95th percentile (p95) | ${results.api.p95Ms} ms |
| Maximum | ${results.api.maxMs} ms |

### HTTP status counts

| HTTP status | Requests |
|---:|---:|
${statusRows}

- Server-error responses (HTTP 5xx): ${results.api.serverErrors}
- Criterion: p95 must be at most 500 ms.
- Status: **${results.api.passed ? 'PASS' : 'FAIL'}**

## Overall result

**${results.overallPassed ? 'PASS' : 'FAIL'}**

A pass means these measurements met the stated thresholds for this test run.
It does not establish performance for every route, production traffic level,
device, network, or deployment environment.

## Test conditions and limitations

- The page was opened in a fresh browser context for each run.
- API requests were sent sequentially, not concurrently.
- The configured API endpoint and request payload are recorded above.
- The default login test uses invalid test credentials and measures the login
  endpoint's response time; it does not measure every API route.
- Repeat this test against representative endpoints and under the expected
  concurrent-user load before making a system-wide performance claim.
- This report records observed results; it does not alter application behavior.
`;
}

async function main() {
  if (
    !Number.isInteger(PAGE_RUNS) || PAGE_RUNS < 1 ||
    !Number.isInteger(WARMUP_REQUESTS) || WARMUP_REQUESTS < 0 ||
    !Number.isInteger(API_REQUESTS) || API_REQUESTS < 1
  ) {
    throw new Error(
      'PAGE_RUNS and API_REQUESTS must be positive integers; ' +
      'WARMUP_REQUESTS must be a non-negative integer.'
    );
  }

  const results = {
    generatedAt: new Date().toISOString(),
    pageLoad: null,
    api: null,
    overallPassed: false,
  };

  results.pageLoad = await measurePages();
  results.api = await measureApi();
  results.overallPassed = results.pageLoad.passed && results.api.passed;

  await mkdir(DIR, { recursive: true });
  await writeFile(
    path.join(DIR, 'performance-results.json'),
    `${JSON.stringify(results, null, 2)}\n`
  );
  await writeFile(
    path.join(DIR, 'performance-report.md'),
    createReport(results)
  );

  console.log('\n--- Performance summary ---');
  console.log(`Maximum page load: ${results.pageLoad.maxLoadMs} ms`);
  console.log(`API p95: ${results.api.p95Ms} ms`);
  console.log(`Page-load criterion: ${results.pageLoad.passed ? 'PASS' : 'FAIL'}`);
  console.log(`API criterion: ${results.api.passed ? 'PASS' : 'FAIL'}`);
  console.log(`Overall: ${results.overallPassed ? 'PASS' : 'FAIL'}`);
  console.log('Report: performance/performance-report.md');
  console.log('Raw results: performance/performance-results.json');

  if (!results.overallPassed) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('Performance test failed:', error.message);
  process.exitCode = 1;
});
