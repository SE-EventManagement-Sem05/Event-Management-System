# Eventide EMS — Updated Test Plan
**Updated:** 12 November 2026

## Scope
Validate the six assigned functional requirements and run the available frontend regression suite.

| ID | Requirement / area | Planned test evidence | Latest status |
|---|---|---|---|
| TP-01 | FR-04 role-based access | Auth API, ProtectedRoute, auth and login journey tests | **Passed** |
| TP-02 | FR-08 attendee event listing | Attendee events API and dashboard tests | **Passed** |
| TP-03 | FR-09 search/filter | Search API and frontend events utility tests | **Passed** |
| TP-04 | FR-10 registration | Registration API and frontend event tests | **Passed in executed automated tests** |
| TP-05 | FR-11 simulated payment | Payment API/controller and frontend regression | **Passed in executed automated tests** |
| TP-06 | FR-13 logout | Attendee dashboard logout component test | **Passed** |
| TP-07 | Frontend regression | Full Vitest suite | **Passed: 194/194** |
| TP-08 | Targeted backend regression | Six selected Jest suites | **Passed: 86/86** |
| TP-09 | Fresh code coverage | Vitest/Jest coverage runs | **Not run in this execution** |
| TP-10 | Full backend regression | All backend test suites, including non-default test paths | **Not run / not established** |
| TP-11 | Manual acceptance on deployed system | Browser-based end-to-end checks | **Not recorded** |

## Exit criteria
- All tests in the declared targeted suites pass.
- Failures and warnings are recorded without misclassifying warnings as failures.
- Coverage and manual acceptance are reported separately from test execution.

## Current result
The automated targeted test exit criteria are met for the runs recorded above. Coverage measurement, full backend regression, and manual deployed-system acceptance remain outstanding.
