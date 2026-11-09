# EMS-NFR-01 Performance Test Report

## Test environment

- Date/time: 2026-11-08T06:12:09.862Z
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
| 1 | 189.88 | 200 | PASS |
| 2 | 203.76 | 200 | PASS |
| 3 | 161.39 | 200 | PASS |
| 4 | 219.44 | 200 | PASS |
| 5 | 219.84 | 200 | PASS |

- Average measured load: 198.86 ms
- Maximum measured load: 219.84 ms
- Criterion: every measured page load must be at most 5,000 ms.
- Status: **PASS**

## API response-time results

| Metric | Measured time |
|---|---:|
| Minimum | 47.75 ms |
| Average | 49.26 ms |
| Median (p50) | 49.16 ms |
| 95th percentile (p95) | 50.74 ms |
| Maximum | 52.5 ms |

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
