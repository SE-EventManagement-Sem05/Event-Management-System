# Combined Branch Coverage Report (Backend + Frontend)

Generated: 2026-11-08T05:58:26Z\
Coverage Threshold: Branches ≥ 80%

## 1. Backend Branch Coverage

### 1.1 Test Execution Results

All 15 backend test suites passed successfully.

| Test Suite                    | Status | Execution Time |
| ----------------------------- | ------ | -------------- |
| reviews.api.test.js           | PASS   | 202.897 s      |
| eventManagement.test.js       | PASS   | 68.623 s       |
| eventDetails.test.js          | PASS   | 38.117 s       |
| hostEvents.test.js            | PASS   | 19.938 s       |
| login.test.js                 | PASS   | 13.263 s       |
| reviewController.unit.test.js | PASS   | —              |
| auth.test.js                  | PASS   | —              |
| hostEvents.api.test.js        | PASS   | —              |
| eventManagement.api.test.js   | PASS   | —              |
| eventDetails.api.test.js      | PASS   | —              |
| errorResponses.api.test.js    | PASS   | —              |
| eventController.unit.test.js  | PASS   | —              |
| envConfig.test.js             | PASS   | —              |
| config.unit.test.js           | PASS   | —              |
| mongo.unit.test.js            | PASS   | —              |

### 1.2 Backend Coverage by File

| File / Module       | Statements | Branches | Functions | Lines  |
| ------------------- | ---------- | -------- | --------- | ------ |
| All files           | 96.67%     | 97.71%   | 94.11%    | 96.93% |
| backend             | 90.17%     | 92.18%   | 83.33%    | 90.99% |
| config.js           | 100%       | 100%     | 100%      | 100%   |
| db.js               | 100%       | 100%     | 100%      | 100%   |
| mongo.js            | 93.33%     | 100%     | 50%       | 100%   |
| server.js           | 88.5%      | 90.9%    | 90%       | 88.5%  |
| backend/controllers | 100%       | 100%     | 100%      | 100%   |
| eventController.js  | 100%       | 100%     | 100%      | 100%   |
| reviewController.js | 100%       | 100%     | 100%      | 100%   |
| backend/models      | 100%       | 100%     | 100%      | 100%   |
| Event.js            | 100%       | 100%     | 100%      | 100%   |
| Registration.js     | 100%       | 100%     | 100%      | 100%   |
| Review\.js          | 100%       | 100%     | 100%      | 100%   |
| backend/validators  | 100%       | 100%     | 100%      | 100%   |
| eventValidator.js   | 100%       | 100%     | 100%      | 100%   |

### 1.3 Backend Coverage Summary

| Metric     | Coverage | Covered / Total |
| ---------- | -------- | --------------- |
| Statements | 96.67%   | 320 / 331       |
| Branches   | 97.71%   | 214 / 219       |
| Functions  | 94.11%   | 32 / 34         |
| Lines      | 96.93%   | 316 / 326       |

Backend Test Summary:

- Test Suites: 15 passed, 15 total
- Tests: 284 passed, 284 total
- Snapshots: 0 total
- Execution Time: 362.844 seconds

## 2. Frontend Branch Coverage

### 2.1 Test Execution Results

All 21 frontend test files passed successfully.

| Metric             | Result        |
| ------------------ | ------------- |
| Test Files Passed  | 21 / 21       |
| Tests Passed       | 194 / 194     |
| Execution Duration | 37.61 seconds |

### 2.2 Frontend Coverage by File

| File / Module            | Statements | Branches | Functions | Lines  |
| ------------------------ | ---------- | -------- | --------- | ------ |
| All files                | 92.24%     | 86.31%   | 93.07%    | 93.85% |
| src                      | 50%        | 100%     | 100%      | 50%    |
| App.jsx                  | 100%       | 100%     | 100%      | 100%   |
| main.jsx                 | 0%         | 100%     | 100%      | 0%     |
| src/components           | 91.27%     | 85.92%   | 97.77%    | 94.70% |
| ErrorMessage.jsx         | 100%       | 80%      | 100%      | 100%   |
| EventForm.jsx            | 97.36%     | 86.36%   | 100%      | 100%   |
| EventSection.jsx         | 92.85%     | 88.88%   | 100%      | 100%   |
| Footer.jsx               | 100%       | 100%     | 100%      | 100%   |
| Layout.jsx               | 100%       | 100%     | 100%      | 100%   |
| Logo.jsx                 | 100%       | 100%     | 100%      | 100%   |
| Navbar.jsx               | 100%       | 100%     | 100%      | 100%   |
| Orbs.jsx                 | 93.33%     | 50%      | 100%      | 100%   |
| ProtectedRoute.jsx       | 90%        | 89.65%   | 100%      | 92.30% |
| Reveal.jsx               | 62.50%     | 55.55%   | 75%       | 64.28% |
| ReviewSection.jsx        | 100%       | 92.85%   | 100%      | 100%   |
| src/pages                | 91.28%     | 81.25%   | 89.83%    | 92.47% |
| AttendeeDashboard.jsx    | 100%       | 75%      | 100%      | 100%   |
| AttendeeEventDetails.jsx | 74%        | 50%      | 72.72%    | 76.08% |
| CreateEvent.jsx          | 100%       | 100%     | 100%      | 100%   |
| EditEvent.jsx            | 92.85%     | 75%      | 85.71%    | 96.15% |
| EventDetails.jsx         | 97.05%     | 85.18%   | 100%      | 100%   |
| HostDashboard.jsx        | 78.94%     | 83.33%   | 77.77%    | 78.94% |
| Landing.jsx              | 100%       | 100%     | 100%      | 100%   |
| Login.jsx                | 97.50%     | 90.90%   | 100%      | 97.29% |
| Signup.jsx               | 100%       | 100%     | 100%      | 100%   |
| src/utils                | 97.02%     | 96.47%   | 92%       | 96.77% |
| auth.js                  | 100%       | 100%     | 100%      | 100%   |
| eventForm.js             | 100%       | 100%     | 100%      | 100%   |
| eventFormat.js           | 100%       | 100%     | 100%      | 100%   |
| events.js                | 89.65%     | 88.88%   | 80%       | 89.28% |

### 2.3 Frontend Coverage Summary

| Metric     | Coverage | Covered / Total |
| ---------- | -------- | --------------- |
| Statements | 92.24%   | 476 / 516       |
| Branches   | 86.31%   | 328 / 380       |
| Functions  | 93.07%   | 121 / 130       |
| Lines      | 93.85%   | 443 / 472       |

### 2.4 Frontend Warnings

The following warnings were reported during execution:

1. Vite CJS API deprecation: The CommonJS build of Vite's Node API is deprecated.
2. Vite configuration warning: ESM syntax is being used in a file loaded as CommonJS.
3. esbuild deprecation: The `esbuild` option specified by the React Babel plugin is deprecated; `oxc` is recommended instead.
4. React Router future flag warnings:
   - `v7_startTransition`
   - `v7_relativeSplatPath`
5. Navigation limitation: The test environment reported that navigation to another `Document` is not implemented.

These are warnings or environment limitations; the report does not identify them as test failures.

## 3. Combined Backend and Frontend Coverage

### 3.1 Coverage Comparison

| Metric                     | Backend   | Frontend  |
| -------------------------- | --------- | --------- |
| Statements                 | 96.67%    | 92.24%    |
| Branches                   | 97.71%    | 86.31%    |
| Functions                  | 94.11%    | 93.07%    |
| Lines                      | 96.93%    | 93.85%    |
| Test Suites / Files Passed | 15 / 15   | 21 / 21   |
| Tests Passed               | 284 / 284 | 194 / 194 |

### 3.2 Overall Test Execution Summary

| Metric              | Backend | Frontend | Combined |
| ------------------- | ------- | -------- | -------- |
| Test Suites / Files | 15      | 21       | 36       |
| Tests Passed        | 284     | 194      | 478      |
| Failures            | 0       | 0        | 0        |

### 3.3 Branch Coverage Threshold Verification

The required branch coverage threshold is 80%.

| Component | Branch Coverage | Required | Status |
| --------- | --------------- | -------- | ------ |
| Backend   | 97.71%          | ≥ 80%    | PASS   |
| Frontend  | 86.31%          | ≥ 80%    | PASS   |

Overall branch coverage requirement satisfied

Both backend and frontend independently exceed the required 80% branch coverage threshold.

## 4. Coverage Reports and Artifacts

The following temporary HTML coverage report directories were generated:

- Backend: `tests/reports/coverage-backend-temp/`
- Frontend: `tests/reports/coverage-frontend-temp/`

The branch coverage threshold (≥ 80%) is enforced by the test runners.

Report reformatted from the supplied test execution output. Original test results, coverage figures, and warnings have been preserved.
