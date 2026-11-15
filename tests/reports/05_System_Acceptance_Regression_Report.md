# Eventide EMS — System Acceptance / Regression Report
**Execution date:** 12 November 2026

## Overall regression outcome
<details>
<summary>Execution totals</summary>

- Frontend: **21/21 test files passed; 194/194 tests passed**
- Targeted backend: **6/6 suites passed; 86/86 tests passed**
- Combined targeted total: **280 passed; 0 failed**

</details>

## Acceptance evidence
The frontend regression run exercised the major UI journeys and components, including login, signup, guarded routes, host and attendee dashboards, event creation/editing, event details, attendee reviews, logout, and responsive utilities.

Targeted backend runs covered authentication, attendee event listing, attendee search/filtering, registration, and payment API/controller behavior.

## Observations / non-blocking warnings
- Vite CJS API and config-loader deprecation warnings.
- React Router v7 future-flag warnings.
- React `act(...)` warnings associated with asynchronous `EventSection` updates in attendee dashboard tests.
- These warnings did not cause test failures.

## Acceptance limitations
- Backend results are targeted suites, not a complete all-backend regression run.
- No new manual browser acceptance evidence or production deployment verification is included here.
- Fresh code coverage percentages were not generated.
- Performance and responsive reports from earlier runs are not revalidated by this execution.

## Conclusion
**Automated targeted regression: PASS.** The executed frontend suite and six targeted backend suites completed with zero failing tests. Full-system acceptance remains subject to broader backend regression, fresh coverage measurement, and any required manual acceptance checks.
