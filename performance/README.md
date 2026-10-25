
# EMS-NFR-01 Performance Testing

## Requirements
- Page load time <= 5,000 ms.
- API response-time 95th percentile <= 500 ms.

## Tools
- Playwright with Chromium for page-load measurements.
- Node.js built-in fetch and performance timer for API measurements.

## Prerequisites
- Node.js installed.
- Frontend running at http://localhost:5173.
- Backend running at http://localhost:5000.
- Backend test environment configured as required by the existing project.

## Run
1. Install the performance-test dependencies.
2. Install the Playwright Chromium browser.
3. Start the frontend and backend.
4. Run the performance script from the performance directory.

## Configuration
Environment variables:
- BASE_URL: page URL; defaults to http://localhost:5173.
- API_URL: API endpoint; defaults to the login endpoint.
- API_METHOD: HTTP method; defaults to POST.
- API_TOKEN: optional Bearer token for protected APIs.
- API_BODY: optional JSON request body.
- PAGE_RUNS: page-load runs; defaults to 5.
- WARMUP_REQUESTS: excluded API warm-up requests; defaults to 5.
- API_REQUESTS: measured API requests; defaults to 100.

## Outputs
- performance-results.json: raw measurements.
- performance-report.md: documented measurements and verdicts.

The report must contain observed values from the test run. Do not replace
measured values with estimates or expected results.
