# Eventide EMS — Functional Requirement Test Report
**Execution date:** 12 November 2026

| Requirement | Description | Evidence in executed tests | Status |
|---|---|---|---|
| FR-04 | Role-specific interface / protected routing | Backend auth suite; frontend ProtectedRoute, auth and login journey suites | **Passed in targeted tests** |
| FR-08 | Attendee event listing | `attendeeEvents.api.test.js`; attendee dashboard component tests | **Passed in targeted tests** |
| FR-09 | Attendee search and filters | `attendeeEventSearch.api.test.js`; frontend `events.test.js` | **Passed in targeted tests** |
| FR-10 | Attendee event registration | `registration.api.test.js`; related frontend event tests | **Backend API suite passed; frontend full suite passed** |
| FR-11 | Simulated payment | `payment.api.test.js`; `paymentController.unit.test.js`; frontend regression suite | **Targeted backend suites passed; frontend regression passed** |
| FR-13 | Logout | Attendee dashboard logout test verifies token and user are cleared from sessionStorage | **Passed** |

## Interpretation
The six requested requirements have relevant automated test evidence. FR-04, FR-08, FR-09, FR-10, and FR-11 include targeted backend test suites where noted. FR-13 has a frontend component test that checks client-side session cleanup.

## Limitations
Automated tests do not replace a complete manual acceptance run against a deployed environment. In particular, the FR-13 test verifies browser session storage cleanup; it is not evidence of a separate server-side logout endpoint.
