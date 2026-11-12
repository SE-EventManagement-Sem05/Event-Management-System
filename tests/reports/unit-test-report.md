# Combined Unit Test Report (Backend + Frontend)

Generated: 2026-11-08T05:57:39Z

## 1. Backend Unit Tests

### Test Results

| Test Suite                      | Result |
| ------------------------------- | ------ |
| `reviewController.unit.test.js` | PASS   |
| `eventController.unit.test.js`  | PASS   |
| `mongo.unit.test.js`            | PASS   |
| `config.unit.test.js`           | PASS   |

### Backend Summary

| Metric             | Result  |
| ------------------ | ------- |
| Test suites passed | 4 / 4   |
| Tests passed       | 68 / 68 |
| Snapshots          | 0       |
| Execution time     | 6.946 s |

Result: All backend unit test suites passed.

## 2. Frontend Unit / Component Tests

### Build and Configuration Warnings

The frontend test run reported the following warnings:

- Vite Node API: The CommonJS (CJS) build of Vite's Node API is deprecated.
- Vite configuration: The configuration uses ESM syntax in a file loaded as CommonJS (`../tests/configs/vitest.config.js`). Vite recommends using a `.mjs` extension or setting `"type": "module"` in the closest `package.json`.
- esbuild options: The `esbuild` option specified by the `vite:react-babel` plugin is deprecated; Vite recommends using `oxc` instead.
- Dependency optimization: `optimizeDeps.esbuildOptions` is deprecated in favour of `optimizeDeps.rolldownOptions`.
- Configuration precedence: Both esbuild and OXC options were set. OXC options were used, and esbuild options were ignored. The ignored esbuild options were `{ jsx: 'automatic', jsxImportSource: undefined }`.

### React Router Future Flag Warnings

The tests reported two React Router warnings:

- `v7_startTransition`: React Router will begin wrapping state updates in `React.startTransition` in v7.
- `v7_relativeSplatPath`: Relative route resolution within Splat routes will change in v7.

### Frontend Test Results

| Test File                       | Tests Passed | Result |
| ------------------------------- | ------------ | ------ |
| `EventSection.test.jsx`         | 12           | PASS   |
| `Signup.test.jsx`               | 7            | PASS   |
| `EventDetails.test.jsx`         | 14           | PASS   |
| `Navbar.test.jsx`               | 6            | PASS   |
| `AttendeeEventDetails.test.jsx` | 3            | PASS   |
| `EditEvent.test.jsx`            | 6            | PASS   |
| `HostDashboard.test.jsx`        | 7            | PASS   |
| `App.test.jsx`                  | 11           | PASS   |
| `ProtectedRoute.test.jsx`       | 7            | PASS   |
| `ErrorMessage.test.jsx`         | 3            | PASS   |
| `AttendeeDashboard.test.jsx`    | 3            | PASS   |
| `Login.test.jsx`                | 16           | PASS   |
| `CreateEvent.test.jsx`          | 3            | PASS   |
| `Landing.test.jsx`              | 13           | PASS   |
| `EventForm.test.jsx`            | 10           | PASS   |
| `eventFormat.test.js`           | 12           | PASS   |
| `loginFlow.test.jsx`            | 3            | PASS   |
| `events.test.js`                | 15           | PASS   |
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
| Start time          | 05:57:52  |
| Total duration      | 34.05 s   |
| Transform time      | 10.38 s   |
| Setup time          | 113.84 s  |
| Import time         | 45.23 s   |
| Test execution time | 7.65 s    |
| Environment time    | 327.36 s  |

Result: All frontend unit and component test files passed.

## 3. Overall Unit Test Summary

| Area                            | Result |
| ------------------------------- | ------ |
| Backend unit tests              | PASS   |
| Frontend unit / component tests | PASS   |

### Combined Test Totals

| Metric                  | Result     |
| ----------------------- | ---------- |
| Backend test suites     | 4 passed   |
| Backend tests           | 68 passed  |
| Frontend test files     | 21 passed  |
| Frontend tests          | 194 passed |
| Total test suites/files | 25 passed  |
| Total tests passed      | 262        |
| Reported test failures  | 0          |

Final Result: Backend unit tests covering controllers, configuration, and MongoDB, along with all frontend component tests, completed successfully. All 262 reported tests passed.
