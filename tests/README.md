# EMS Tests (restructured)

This folder consolidates all executable tests that previously lived under
`verification/`, project root (responsive), and `performance/`.

Target layout (project root):

```
.
├── backend/
├── frontend/
├── deliverables/          # SRS, SAD, test plan
└── tests/                 # this folder
    ├── backend/           # Jest backend unit + API/integration tests
    ├── frontend/          # Vitest frontend component / flow tests
    ├── performance/       # Page-load + API latency runner
    ├── responsive/        # Viewport / overflow acceptance checks
    ├── configs/           # Jest + Vitest configs (paths relative to project root)
    ├── scripts/           # Runners that emit the five required reports
    ├── reports/           # ONLY place reports are written
    └── README.md
```

## Required reports (only these under `tests/reports/`)

| Report | File | Produced by |
|--------|------|-------------|
| 1. Combined unit test report | `unit-test-report.md` | `./tests/scripts/run-unit.sh` |
| 2. Combined performance report | `performance-report.md` | `./tests/scripts/run-performance.sh` |
| 3. Combined branch coverage report | `branch-coverage-report.md` | `./tests/scripts/run-coverage.sh` |
| 4. Combined code coverage report | `code-coverage-report.md` | `./tests/scripts/run-coverage.sh` |
| 5. Combined system acceptance report | `system-acceptance-report.md` | `./tests/scripts/run-system-acceptance.sh` |

Temporary coverage HTML/LCOV may appear under `tests/reports/coverage-*-temp/` for inspection; the canonical human-readable reports are the five Markdown files above.

Coverage thresholds remain **≥ 80%** for statements, branches, functions and lines (enforced by Jest and Vitest configs).

## Prerequisites

- Project root contains `backend/` and `frontend/` (with their `node_modules` installed).
- Backend has test helpers at `backend/tests/setupEnv.js` and `backend/tests/support/*` (unchanged).
- MongoDB available for backend integration tests (or `TEST_MONGODB_URI` set).
- For live performance / responsive scripts: start frontend (`cd frontend && npm run dev`) and backend (`cd backend && node server.js`) first.

## Execution commands

**Always run from the project root** (the directory that contains `backend/`, `frontend/` and `tests/`).

```bash
# Make scripts executable (once)
chmod +x tests/scripts/*.sh

# 1. Unit tests only → tests/reports/unit-test-report.md
./tests/scripts/run-unit.sh

# 2+3. Code + branch coverage (runs full suites with coverage) →
#      tests/reports/code-coverage-report.md
#      tests/reports/branch-coverage-report.md
./tests/scripts/run-coverage.sh

# 4. System acceptance (all functional/API + responsive) →
#      tests/reports/system-acceptance-report.md
./tests/scripts/run-system-acceptance.sh

# 5. Performance (page load ≤ 5s, API p95 ≤ 500 ms) →
#      tests/reports/performance-report.md
./tests/scripts/run-performance.sh

# 6. Requirements Compatibility
#       npx jest --config tests/configs/jest.backend.config.cjs --runInBand --runTestsByPath tests/backend/requirements-verification.test.js
# Everything (produces all five reports)
./tests/scripts/run-all.sh
```

### Directory notes

| Command | Working directory used by the script | Config / tests path |
|---------|--------------------------------------|---------------------|
| Backend Jest | `backend/` | `tests/configs/jest.backend.config.cjs` → matches `tests/backend/**/*.test.js` |
| Frontend Vitest | `frontend/` | `tests/configs/vitest.config.js` → matches `tests/frontend/**/*.test.{js,jsx}` |
| Performance | `tests/performance/` | writes into `tests/reports/` |
| Responsive | `tests/responsive/` | writes into `tests/reports/` |

You do **not** need to edit `frontend/vite.config.js` or `backend/package.json` for these runners; the scripts pass `--config` explicitly.

## Mapping to previous layout

| Old location | New location |
|--------------|--------------|
| `verification/tests/backend/*` | `tests/backend/` |
| `verification/tests/frontend/*` | `tests/frontend/` |
| `verification/jest.backend.config.cjs` | `tests/configs/jest.backend.config.cjs` (paths updated) |
| `verification/run-*.sh` | `tests/scripts/run-*.sh` (combined reports) |
| `performance/*` | `tests/performance/` |
| `verify-responsive.mjs` (root) | `tests/responsive/verify-responsive.mjs` |

Legacy separate per-side report folders under `verification/reports/` are no longer used.

## Alignment with SRS / SAD / Test Plan

- **Unit tests**: backend controller/config/mongo unit suites + frontend component tests.
- **System acceptance**: full Jest + Vitest suites (auth, events, reviews, dashboards, flows) plus responsive NFR checks.
- **Performance (EMS-NFR-01)**: page load ≤ 5 s, API p95 ≤ 500 ms (login endpoint measurement).
- **Coverage**: 80% statements / branches / functions / lines enforced for both backend and frontend.
- Security-related cases (JWT, password hashing, role checks, error responses) remain inside the existing backend API/unit suites.

No redundant or unused test files were carried over; only the actively executed suites from verification, performance and root responsive verification are present.
