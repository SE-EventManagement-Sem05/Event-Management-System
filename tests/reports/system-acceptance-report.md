# Combined System Acceptance Report (Backend + Frontend)

Generated: 2026-11-08T06:05:15Z

Coverage: Functional, API, integration, and responsive acceptance checks aligned with the SRS, SAD, and Test Plan.

## 1. Backend Acceptance / API / Integration Tests

### Test Results

| Test Suite                      | Result | Execution Time |
| ------------------------------- | ------ | -------------- |
| `reviews.api.test.js`           | PASS   | 219.033 s      |
| `eventManagement.test.js`       | PASS   | 64.483 s       |
| `eventDetails.test.js`          | PASS   | 34.571 s       |
| `hostEvents.test.js`            | PASS   | 19.144 s       |
| `login.test.js`                 | PASS   | 12.775 s       |
| `auth.test.js`                  | PASS   | —              |
| `hostEvents.api.test.js`        | PASS   | —              |
| `eventDetails.api.test.js`      | PASS   | —              |
| `eventManagement.api.test.js`   | PASS   | —              |
| `errorResponses.api.test.js`    | PASS   | —              |
| `reviewController.unit.test.js` | PASS   | —              |
| `envConfig.test.js`             | PASS   | —              |
| `eventController.unit.test.js`  | PASS   | —              |
| `mongo.unit.test.js`            | PASS   | —              |
| `config.unit.test.js`           | PASS   | —              |

### Backend Summary

| Metric               | Result    |
| -------------------- | --------- |
| Test suites passed   | 15 / 15   |
| Tests passed         | 284 / 284 |
| Snapshots            | 0         |
| Total execution time | 370.086 s |

Result: All backend acceptance, API, integration, and unit test suites passed.

## 2. Frontend Acceptance / Component / Flow Tests

### Build and Configuration Warnings

The frontend test run reported the following warnings:

- Vite Node API: The CommonJS (CJS) build of Vite's Node API is deprecated.
- Vite configuration: The configuration uses ESM syntax in a file loaded as CommonJS (`../tests/configs/vitest.config.js`). Vite recommends using a `.mjs` extension or setting `"type": "module"` in the closest `package.json`.
- esbuild options: The `esbuild` option specified by the `vite:react-babel` plugin is deprecated; Vite recommends using `oxc` instead.
- Dependency optimization: `optimizeDeps.esbuildOptions` is deprecated in favour of `optimizeDeps.rolldownOptions`.
- Configuration precedence: Both esbuild and OXC options were set. OXC options were used, and esbuild options were ignored.

### React Router Future Flag Warnings

The tests reported two React Router warnings:

- `v7_startTransition`: React Router will begin wrapping state updates in `React.startTransition` in v7.
- `v7_relativeSplatPath`: Relative route resolution within Splat routes will change in v7.

### Frontend Test Results

| Test File                       | Tests Passed | Result |
| ------------------------------- | ------------ | ------ |
| `Landing.test.jsx`              | 13           | PASS   |
| `Signup.test.jsx`               | 7            | PASS   |
| `HostDashboard.test.jsx`        | 7            | PASS   |
| `EventForm.test.jsx`            | 10           | PASS   |
| `Login.test.jsx`                | 16           | PASS   |
| `Navbar.test.jsx`               | 6            | PASS   |
| `ErrorMessage.test.jsx`         | 3            | PASS   |
| `CreateEvent.test.jsx`          | 3            | PASS   |
| `loginFlow.test.jsx`            | 3            | PASS   |
| `events.test.js`                | 15           | PASS   |
| `App.test.jsx`                  | 11           | PASS   |
| `AttendeeEventDetails.test.jsx` | 3            | PASS   |
| `EventDetails.test.jsx`         | 14           | PASS   |
| `EventSection.test.jsx`         | 12           | PASS   |
| `ProtectedRoute.test.jsx`       | 7            | PASS   |
| `EditEvent.test.jsx`            | 6            | PASS   |
| `eventFormat.test.js`           | 12           | PASS   |
| `AttendeeDashboard.test.jsx`    | 3            | PASS   |
| `eventForm.test.js`             | 30           | PASS   |
| `auth.test.js`                  | 8            | PASS   |
| `responsive.test.js`            | 5            | PASS   |

### Additional Runtime Message

The following message appeared during the test run:

```
Not implemented: navigation to another Document
```

### Frontend Summary

| Metric              | Result    |
| ------------------- | --------- |
| Test files passed   | 21 / 21   |
| Tests passed        | 194 / 194 |
| Start time          | 06:11:30  |
| Total duration      | 34.16 s   |
| Transform time      | 12.76 s   |
| Setup time          | 103.17 s  |
| Import time         | 42.49 s   |
| Test execution time | 7.88 s    |
| Environment time    | 293.99 s  |

Result: All frontend component, flow, and acceptance test files passed.

## 3. Responsive Layout Acceptance (EMS-NFR-03)

Prerequisite: The frontend development server must be running at `BASE_URL` (default: `http://localhost:5173`).

### Responsive Test Results

The following routes were tested at four viewport widths:

| Route     | 360px | 768px | 1024px | 1920px |
| --------- | ----- | ----- | ------ | ------ |
| `/`       | PASS  | PASS  | PASS   | PASS   |
| `/login`  | PASS  | PASS  | PASS   | PASS   |
| `/signup` | PASS  | PASS  | PASS   | PASS   |

All checks returned HTTP 200, and the reported document width matched the tested viewport width.

### Responsive Test Summary



PASS

&#x20;Overall responsive acceptance result



- All 3 routes passed at all 4 viewport widths.
- Total responsive checks: 12.
- No failed checks were reported.

### Generated Artifacts

| Artifact               | Location                                |
| ---------------------- | --------------------------------------- |
| Raw responsive results | `tests/reports/responsive-results.json` |
| Responsive report      | `tests/reports/responsive-report.md`    |

## 4. Overall System Acceptance Summary

| Area                                         | Result |
| -------------------------------------------- | ------ |
| Backend acceptance / API / integration tests | PASS   |
| Frontend component / flow / acceptance tests | PASS   |
| Responsive layout acceptance (EMS-NFR-03)    | PASS   |

### Combined Test Totals

| Metric                  | Result     |
| ----------------------- | ---------- |
| Backend test suites     | 15 passed  |
| Backend tests           | 284 passed |
| Frontend test files     | 21 passed  |
| Frontend tests          | 194 passed |
| Total test suites/files | 36 passed  |
| Total tests passed      | 478        |
| Reported test failures  | 0          |
| Responsive checks       | 12 passed  |

Final Result: System acceptance suites completed successfully. All reported backend and frontend tests passed, and all responsive layout checks passed.

