# FR-11: Simulated Payment — Test Execution Report

## 1. Execution Information

**Feature ID:** EMS-FR-11\
**Feature Name:** Simulated Payment\
**Execution Date:** 2026-11-12\
**Testing Framework:** Jest\
**Status:** FR-11-specific backend tests passed

## 2. Backend Unit Test Results

**Test File:** `tests/backend/paymentController.unit.test.js`

| Metric | Result |
|---|---:|
| Tests Passed | 19 |
| Tests Failed | 0 |
| Total Tests | 19 |
| Result | PASS |

All 19 payment controller unit tests passed.

## 3. Backend API Integration Test Results

**Test File:** `tests/backend/payment.api.test.js`

| Metric | Result |
|---|---:|
| Tests Passed | 15 |
| Tests Failed | 0 |
| Total Tests | 15 |
| Result | PASS |

All 15 payment API integration tests passed when executed individually.

## 4. Payment Controller Code Coverage

The dedicated Jest coverage report was generated for:

`backend/controllers/paymentController.js`

| Coverage Metric | Covered | Total | Percentage |
|---|---:|---:|---:|
| Statements | 32 | 32 | 100% |
| Branches | 23 | 24 | 95.83% |
| Functions | 1 | 1 | 100% |
| Lines | 32 | 32 | 100% |

One branch remains uncovered.

Coverage artifacts:

- `tests/reports/coverage-fr11/coverage-summary.json`
- `tests/reports/coverage-fr11/lcov.info`

The detailed HTML report is retained locally in `tests/reports/coverage-fr11/` and is not included in the Git commit.

## 5. Frontend Manual Testing

The attendee checkout flow was manually tested in the browser. The user confirmed completion of the provided test scenarios.

Scenarios covered:

- Paid event registration and checkout display.
- Successful simulated payment.
- Failed simulated payment.
- Retry after payment failure.
- Free event registration without checkout.
- Payment submission loading state.

**Manual testing result:** Reported completed by the user.

No separate FR-11 frontend automated test results are claimed in this report.

## 6. Full Backend Suite — Known Results

An earlier full backend test run reported:

| Metric | Result |
|---|---:|
| Tests Passed | 312 |
| Tests Failed | 5 |
| Total Tests | 317 |

The failures involved:

- Review controller upcoming-event test expectations.
- Event details response field expectations.
- MongoDB Atlas connection timeouts in payment API tests.

The payment API suite subsequently passed all 15 tests when run individually, and all 19 payment controller unit tests passed.

The full backend suite should therefore not be considered completely green based on the available results.

## 7. Existing Frontend Suite Baseline

The repository's existing combined frontend test report, generated on 2026-11-08, recorded:

- 21 test files passed.
- 194 tests passed.
- Statements: 92.24%.
- Branches: 86.31%.
- Functions: 93.07%.
- Lines: 93.85%.

These are pre-FR-11 baseline results, not a new post-FR-11 automated test run.

## 8. Overall Conclusion

The FR-11 backend implementation passed its dedicated unit and API integration tests.

The payment controller achieved 100% statement, function and line coverage, with 95.83% branch coverage.

The frontend checkout scenarios were manually tested and reported completed.

The full backend suite still has previously observed failures that require separate investigation. The feature uses simulated payment outcomes and is not a production payment integration.
