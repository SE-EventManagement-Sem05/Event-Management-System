# Eventide EMS — Code Coverage Report
**Report date:** 12 November 2026

## Coverage status
**Fresh coverage percentages: Not measured in the final execution recorded for this report.**

The final frontend command was a normal Vitest run without `--coverage`. The targeted backend Jest runs were also recorded as test executions, not as a combined fresh coverage run.

| Metric | Frontend | Backend |
|---|---|---|
| Statements | Not freshly measured | Not freshly measured |
| Branches | Not freshly measured | Not freshly measured |
| Functions | Not freshly measured | Not freshly measured |
| Lines | Not freshly measured | Not freshly measured |

## Important reporting note
Earlier repository reports contained coverage figures, but they predate the latest requirement merges and test fixes. They should not be presented as current coverage for this execution.

## Commands to generate fresh coverage
Frontend (from `frontend`):
```powershell
npx vitest run --config ..\tests\configs\vitest.config.js --coverage
```
Backend (from `backend`; uses the shared Jest config):
```powershell
npx jest --config ../tests/configs/jest.backend.config.cjs --runInBand --coverage
```
The configured backend test matcher may omit API tests under `backend/tests`; include those separately or update the matcher before reporting combined backend coverage.
