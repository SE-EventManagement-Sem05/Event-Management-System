# Eventide EMS — Test Execution Report
**Execution date:** 12 November 2026

## Summary
| Test area | Suites/files | Tests | Result |
|---|---:|---:|---|
| Frontend regression (Vitest) | 21 | 194 | **194 passed, 0 failed** |
| Targeted backend (Jest) | 6 | 86 | **86 passed, 0 failed** |
| Combined targeted execution | 27 | 280 | **280 passed, 0 failed** |

## Frontend execution
Command (run from `frontend`):
```powershell
npx vitest run --config ..\tests\configs\vitest.config.js
```
Result: 21 test files passed; 194 tests passed; duration 51.93 seconds.

## Backend execution
The following targeted suites passed:
- `tests/backend/auth.test.js`
- `tests/backend/payment.api.test.js`
- `tests/backend/paymentController.unit.test.js`
- `backend/tests/attendeeEvents.api.test.js`
- `backend/tests/attendeeEventSearch.api.test.js`
- `backend/tests/registration.api.test.js`

Result: 6 suites and 86 tests passed.

## Notes
- The backend result is a targeted run, not a claim that every backend test in the repository passed.
- Vite/React Router deprecation and future-flag warnings appeared. They did not fail tests.
- React `act(...)` warnings appeared in attendee dashboard component tests. Tests still passed.
- The EventForm saving-label encoding defect was corrected in the component; the subsequent full frontend run passed.
