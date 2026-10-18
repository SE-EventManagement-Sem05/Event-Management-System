# EMS-NFR-01 Performance Test Report

## Test environment

- Date/time: 2026-10-18T10:22:00.242Z
- Page-load tool: Playwright (Chromium, headless)
- API measurement tool: Node.js built-in fetch and performance timer
- Page URL: http://localhost:5173
- API endpoint: POST http://localhost:5000/api/auth/login
- Page-load limit: 5000 ms
- API p95 limit: 500 ms
- Page-load runs: 5
- API warm-up requests excluded: 5
- API measured requests: 100

## Page-load results

| Run | Elapsed time (ms) | HTTP status | Result |
|---:|---:|---:|---|
| 1 | 3124.12 | 200 | PASS |
| 2 | 314.21 | 200 | PASS |
| 3 | 273.47 | 200 | PASS |
| 4 | 234.45 | 200 | PASS |
| 5 | 278.8 | 200 | PASS |

- Average measured load: 845.01 ms
- Maximum measured load: 3124.12 ms
- Criterion: every measured page load must be at most 5,000 ms.
- Status: **PASS**

## API response-time results

| Metric | Measured time |
|---|---:|
| Minimum | 47.09 ms |
| Average | 51.24 ms |
| Median (p50) | 50.06 ms |
| 95th percentile (p95) | 57.95 ms |
| Maximum | 62.12 ms |

### HTTP status counts

| HTTP status | Requests |
|---:|---:|
| 401 | 100 |

- Server-error responses (HTTP 5xx): 0
- Criterion: p95 must be at most 500 ms.
- Status: **PASS**

## Overall result

**PASS**

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
