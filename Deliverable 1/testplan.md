# Software Test Plan (STP): Event Management System

| | |
|---|---|
| **Project** | Event Management System |
| **Version** | 1.1 (updated for Sprint 1 and Sprint 2 implementation) |
| **Authors** | Piya, Sharanya, Ananya |
| **Date** | 28-09-2026 (v1.0), revised 08-11-2026 (v1.1) |
| **Status** | Partially outlined testcases |

---

## 1. Introduction

**Purpose:** This document defines the test plan for the Event Management System v1.0. It outlines objectives, scope, strategy, resources, schedule, and responsibilities for testing. The updated version 1.1 outlines the exact test cases followed successfully. There are 403 test cases which have been included for FR-01, FR-03, FR-05, FR-06, FR-07, FR-12, FR-14, NFR-01, NFR-05, NFR-03.

**Scope:** Testing covers Event Management System features such as landing page, signup, role-based login with JWT, dashboards and route-protection, host event list, host event creation and details, and for error handling. Currently there are about 284 tests for backend and 194 for frontend. Further tests have to be implemented yet.

**References:** EMS SRS v1.0, EMS Software Architecture and Design Specification v1.0.

**Definitions:**

| Term | Meaning |
|------|---------|
| EMS | Event Management System |
| JWT | JSON Web Token |
| RBAC | Role-Based Access Control |
| SRS | Software Requirements Specification |
| RTM | Requirements Traceability Matrix |
| TC | Test Case |
| FR | Functional Requirement |
| NFR | Non-Functional Requirement |
| SEC | Security Requirement |
| mins | minutes |

---

## 2. Test Items


| Test item | Primary location | Planned automated suites |
|-----------|------------------|--------------------------|
| Frontend pages, components and utilities | `frontend/src` | `tests/frontend/*.test.jsx`, `tests/frontend/*.test.js` |
| Authentication (signup, login, JWT, RBAC) | `backend/server.js`, `backend/db.js` | `tests/backend/auth.test.js`, `tests/backend/login.test.js` |
| Event management (list, details, create, edit, validation) | `backend/controllers/eventController.js`, validators, models | `tests/backend/eventController.unit.test.js`, `hostEvents*.test.js`, `eventDetails*.test.js`, `eventManagement*.test.js` |
| Review and rating module | `backend/controllers/reviewController.js`, models | `tests/backend/reviewController.unit.test.js`, `tests/backend/reviews.api.test.js` |
| Configuration and environment | `backend/config.js`, `backend/mongo.js` | `tests/backend/config.unit.test.js`, `tests/backend/envConfig.test.js`, `tests/backend/mongo.unit.test.js` |
| API error handling | Backend middleware / controllers | `tests/backend/errorResponses.api.test.js` |
| Performance (page load + API latency) | Running system | `tests/performance/run-performance.mjs` |
| Responsive layout | Frontend CSS + live pages | `tests/frontend/responsive.test.js`, `tests/responsive/verify-responsive.mjs` |

Supporting helpers remain under `backend/tests/` (setupEnv, dbTool, testServer, helpers) and are not themselves counted as test cases.




---

## 3. Features to be Tested

Features mapped to SRS requirement IDs:

| ID | Feature |
|----|---------|
| EMS-FR-01 | Landing page with signup and login options |
| EMS-FR-02 | Signup as Host or Attendee |
| EMS-FR-03 | Login according to the role, issued JWT if successful |
| EMS-FR-04 | Provide interface for the particular role after login is successful |
| EMS-FR-05 | Host is able to view past and upcoming events |
| EMS-FR-06 | Host is able to view event details |
| EMS-FR-07 | Host can create and edit events |
| EMS-FR-08 | Attendee can view past and upcoming events |
| EMS-FR-09 | Attendee can search and filter events |
| EMS-FR-10 | Attendee can register for an event |
| EMS-FR-11 | Simulated payment logging the transaction |
| EMS-FR-12 | Rating and review provided |
| EMS-FR-13 | Logout from the authenticated page |
| EMS-FR-14 | Clear error messages and retry for failure situations |
| EMS-NFR-01 | Performance: page load ≤ 5 s; 95% of API calls ≤ 500 ms |
| EMS-NFR-02 | Usability: first-time user can complete the login within 2 mins without external aid |
| EMS-NFR-03 | Compatibility: latest Chromium browsers with widths between 360 and 1920 px |
| EMS-NFR-04 | Reliability: recovery from failure without restart |
| EMS-NFR-05 | Configurability: values for MongoDB URI, port, SQLite path, JWT secret read from `.env` configuration file |
| EMS-NFR-06 | Efficiency: indexing of queries, paginated lists, no unbounded caching |
| EMS-SEC-01 | Passwords are stored as salted bcrypt hashes |
| EMS-SEC-02 | JWT expires within 60 mins, and invalid/expired tokens are rejected |
| EMS-SEC-03 | Access control is done on the server side, according to the role |
| EMS-SEC-04 | HTTP is utilised throughout |
| EMS-SEC-05 | Input is validated and sanitised |
| EMS-SEC-06 | Login is locked out after 5 failures for 15 mins |

---

## 4. Features Not to be Tested

- Actual payment integration (payment is simulated)
- Browsers older than two released versions
- Third-party library internals (MERN, bcrypt)
- Additional SMS or notification services (not in requirements)

---

## 5. Test Approach / Strategy

### Levels

- **Unit Testing:** Testing individual frontend components, backend functions, authentication functions, and database operations independently.
- **Integration Testing:** Testing interactions between the React frontend, Node.js/Express backend, SQLite authentication database, and MongoDB application database.
- **System Testing:** Testing the complete Event Management System end-to-end, including authentication, event discovery, registration, simulated payment, dashboards, ratings, reviews, reviewing recommendations and error handling.
- **Acceptance Testing:** Verifying that the implemented system satisfies the functional, performance, usability, and security requirements defined in the SRS.

### Types

- **Functional Testing:** Verification of user registration, login, role-based access, event management, event search and filtering, event recommendations, event registration, simulated payment, ratings, reviews, dashboards, and logout.
- **Regression Testing:** Re-testing previously working functionality after changes or defect fixes.
- **Performance Testing:** Verification that authentication, dashboard data loading, and recommendation refresh operations meet the specified 2-second response requirement under standard network conditions.
- **Usability Testing:** Verification that the web interface is intuitive and easy to navigate for both Hosts and Attendees.
- **Security Testing:** Verification of password hashing, JWT authentication and expiry, role-based authorization, protection of JWT secrets, and protection of authentication information.
- **Error Handling Testing:** Verification that appropriate error messages are displayed and that users can retry supported operations when backend, database, authentication, event, registration, or simulated payment failures occur.

### Entry Criteria

- A stable build of the Event Management System is available for testing.
- The test environment is configured with the required React frontend, Node.js/Express backend, MongoDB, and SQLite components.
- Required test data is available.
- Required environment variables and configuration are available.
- The major system functionality is sufficiently stable for planned testing.

### Exit Criteria

- 100% of planned test cases have been executed.
- All critical and high-severity defects identified during testing have been resolved or formally accepted.
- Functional requirements selected for the test cycle have been verified.
- Performance requirements for authentication, dashboard loading, and recommendation refresh have been tested.
- Security requirements selected for the test cycle have been verified.
- No unresolved defect prevents normal use of the core system functionality.

### 5.1 Security Validation

- **Password Protection:** Verify that user passwords are hashed using bcrypt or an equivalent hashing mechanism before being stored in SQLite, and that plaintext passwords are never stored or logged.
- **JWT Validation:** Verify that protected API endpoints reject requests containing missing, invalid, or expired JWTs with an appropriate authentication error.
- **JWT Expiration:** Verify that authentication tokens expire after the defined session interval and that users are required to authenticate again after expiration.
- **Role-Based Authorization:** Verify that only authenticated users with the appropriate role can access Host- or Attendee-specific functionality.
- **JWT Secret Protection:** Verify that JWT secrets are stored only in server-side environment configuration and are not exposed through the frontend or client-side bundles.
- **Authentication Information Protection:** Verify that sensitive authentication information is not exposed through the frontend, application responses, or system logs.

---

## 6. Test Environment

**Hardware**

- Desktop/laptop computer for development and testing.
- Mobile device for browser-based responsiveness testing.
- Stable network connection.

**Software**

- Event Management System v1.0.
- React.js frontend.
- Node.js with Express.js backend.
- MongoDB database.
- SQLite authentication database.
- Modern web browser such as Google Chrome, Mozilla Firefox, or Microsoft Edge.

**Tools**

- Postman for REST API testing.
- Browser Developer Tools for frontend and network testing.
- A suitable testing framework for unit and integration testing.
- Jira or an equivalent issue-tracking system for defect tracking.

**Test Data**

- Sample Host accounts.
- Sample Attendee accounts.
- Sample event records with different locations and categories.
- Sample event registrations.
- Sample ratings and reviews.
- Sample simulated payment transactions.
- Valid and invalid authentication credentials.

---

## 7. Test Schedule

| Milestone | Target |
|-----------|--------|
| Test-case design complete | 08-11-2026 |
| Test environment ready | Before first execution |
| Unit and API suite implementation | Parallel with product code |
| Coverage gates (≥ 80 %) enforced | Before acceptance |
| Performance and responsive runners | After servers can be started locally |
| Final consolidated reports | End of test cycle |


---

## 8. Test Deliverables

The following deliverables shall be produced during the testing process:

- Software Test Plan (STP) (This document)
- Test Cases
- Test Execution Results - The five consolidated reports under `tests/reports/`:
  1. `unit-test-report.md`
  2. `performance-report.md`
  3. `branch-coverage-report.md`
  4. `code-coverage-report.md`
  5. `system-acceptance-report.md`
- Requirements Traceability Matrix (RTM)
- Test Summary Report

---

## 9. Roles and Responsibilities

| Role | Name | Responsibility |
|------|------|----------------|
| QA Lead | Piya | Prepare the test plan, coordinate testing activities, and review test results |
| Test Engineer | Ananya | Design and execute test cases and report defects |
| Developer | Sharanya | Support testing, investigate defects, and implement fixes |
| Product Owner | Piya | Review test results and approve system readiness |

---

## 10. Risks and Mitigation

| Risk | Mitigation |
|------|------------|
| Delay in receiving a stable build | Begin test planning and test-case preparation before final build delivery |
| Backend or database unavailable during testing | Maintain a configured backup test environment where possible |
| Incorrect or incomplete test data | Prepare and validate test data before test execution |
| Changes to requirements during development | Update affected test cases and perform regression testing |
| Defects in authentication affecting multiple features | Prioritize authentication testing before dependent functionality |
| Simulated payment failures affecting registration testing | Maintain separate test scenarios for successful and failed simulated payments |

---

## 11. Assumptions & Dependencies

**Assumptions**

- MongoDB is available and accessible to the backend.
- SQLite is available for authentication records.
- Required authentication records can be created and retrieved.
- JWT generation and verification mechanisms are available.
- The JWT secret and related configuration are correctly configured.
- Users have access to a functional modern web browser.
- A stable network connection is available during testing.
- Test data required for Host and Attendee functionality is available.

**Dependencies**

- React.js frontend.
- Node.js and Express.js backend.
- MongoDB.
- SQLite.
- Required npm modules and application dependencies.
- Functional web browser.
- Stable network connection.

---

## 12. Suspension & Resumption Criteria

**Suspend testing if:**

- The test environment becomes unavailable.
- The backend or database is unavailable for a significant period.
- A critical defect prevents execution of a major portion of the planned test cases.
- The application build is sufficiently unstable that meaningful test execution cannot continue.

**Resume testing if:**

- The test environment has been restored.
- Blocking or critical defects have been resolved or an acceptable workaround has been provided.
- The backend and required databases are available.
- A stable build is provided for continued testing.

---

## 13. Test Case Management & Traceability

| Requirement | Planned Test Case(s) | Primary suite file(s) |
|-------------|----------------------|------------------------|
| EMS-FR-01 | TC-UI-01 … TC-UI-05 | `Landing.test.jsx`, `Navbar.test.jsx`, `App.test.jsx` |
| EMS-FR-02 | TC-AUTH-01 … TC-AUTH-08 | `auth.test.js` (backend), `Signup.test.jsx` |
| EMS-FR-03 | TC-AUTH-09 … TC-AUTH-18 | `login.test.js`, `auth.test.js`, `Login.test.jsx`, `loginFlow.test.jsx`, `auth.test.js` (frontend) |
| EMS-FR-04 | TC-AUTH-19 … TC-AUTH-26 | `auth.test.js`, `ProtectedRoute.test.jsx` |
| EMS-FR-05 | TC-EVT-01 … TC-EVT-07 | `hostEvents*.test.js`, `eventController.unit.test.js`, `HostDashboard.test.jsx`, `EventSection.test.jsx` |
| EMS-FR-06 | TC-EVT-08 … TC-EVT-13 | `eventDetails*.test.js`, `EventDetails.test.jsx`, `eventFormat.test.js` |
| EMS-FR-07 | TC-EVT-14 … TC-EVT-21 | `eventManagement*.test.js`, `eventController.unit.test.js`, `CreateEvent.test.jsx`, `EditEvent.test.jsx`, `EventForm.test.jsx`, `eventForm.test.js` |
| EMS-FR-08 | TC-ATT-01, TC-ATT-02 | `AttendeeDashboard.test.jsx`, `AttendeeEventDetails.test.jsx` |
| EMS-FR-09 | — | Yet to be done |
| EMS-FR-10 | — | Yet to be done |
| EMS-FR-11 | — | Yet to be done |
| EMS-FR-12 | TC-REV-01 … TC-REV-05 | `reviewController.unit.test.js`, `reviews.api.test.js` |
| EMS-FR-13 | — | Yet to be done |
| EMS-FR-14 | TC-ERR-01 … TC-ERR-05 | `errorResponses.api.test.js`, `ErrorMessage.test.jsx`, form error paths |
| EMS-NFR-01 | TC-PERF-01, TC-PERF-02 | `tests/performance/run-performance.mjs` |
| EMS-NFR-02 | Manual | — |
| EMS-NFR-03 | TC-RESP-01 … TC-RESP-03 | `responsive.test.js`, `verify-responsive.mjs` |
| EMS-NFR-04 | Partial (error paths) | Reliability describes inside host/event suites |
| EMS-NFR-05 | TC-CFG-01 … TC-CFG-03 | `envConfig.test.js`, `config.unit.test.js`, `mongo.unit.test.js` |
| EMS-NFR-06 | Partial (pagination) | `eventController.unit.test.js` (pagination cases) |
| EMS-SEC-01 | TC-SEC-01 | `auth.test.js` |
| EMS-SEC-02 | TC-SEC-02 | `login.test.js`, `auth.test.js` |
| EMS-SEC-03 | TC-SEC-03 | `auth.test.js`, `ProtectedRoute.test.jsx` |
| EMS-SEC-04 | — | Out of scope |
| EMS-SEC-05 | Validation cases under FR-02/07/12 | Multiple suites |
| EMS-SEC-06 | — | Deferred |

---

## 14. Planned Test Cases

Test cases are grouped by requirement. Each group will be realised by one or more files under `tests/`. The identifiers below are the planning IDs; the concrete `describe` / `test` blocks in the source will carry the same EMS-FR / EMS-NFR / EMS-SEC tags for easy tracing.

### 14.1 EMS-FR-01 – Landing page and navigation

| TC ID | Description | Level |
|-------|-------------|-------|
| TC-UI-01 | Landing page renders primary marketing content and calls-to-action | Frontend unit |
| TC-UI-02 | Navigation bar shows logo, Log in, Sign up and section links | Frontend unit |
| TC-UI-03 | Mobile menu opens and closes; selecting a link closes the menu | Frontend unit |
| TC-UI-04 | Public routes (`/`, `/login`, `/signup`) are reachable without authentication | Frontend unit |
| TC-UI-05 | Scrolling changes navigation bar appearance | Frontend unit |

### 14.2 EMS-FR-02 – Signup

| TC ID | Description | Level |
|-------|-------------|-------|
| TC-AUTH-01 | Successful signup of an Attendee and of a Host returns 201 | Backend API |
| TC-AUTH-02 | Password is stored only as a salted bcrypt hash (EMS-SEC-01) | Backend API |
| TC-AUTH-03 | Identical passwords produce different hashes (salting) | Backend API |
| TC-AUTH-04 | Duplicate email (case- and space-insensitive) is rejected with 409 | Backend API |
| TC-AUTH-05 | Injection-style text is stored literally and does not break the schema | Backend API |
| TC-AUTH-06 | Frontend form rejects empty, invalid email, short password and mismatched confirmation | Frontend unit |
| TC-AUTH-07 | Successful frontend submission shows success feedback | Frontend unit |
| TC-AUTH-08 | Network failure on signup shows a clear recoverable message | Frontend unit |

### 14.3 EMS-FR-03 – Login and JWT

| TC ID | Description | Level |
|-------|-------------|-------|
| TC-AUTH-09 | Correct credentials return a token and user object | Backend API |
| TC-AUTH-10 | JWT contains user id and role, is HS256-signed and expires in 60 minutes | Backend API |
| TC-AUTH-11 | Email matching is case- and space-insensitive; password is case-sensitive | Backend API |
| TC-AUTH-12 | Wrong password or unknown email returns the same 401 message and no token | Backend API |
| TC-AUTH-13 | Correct credentials with the wrong role return 403 and no token | Backend API |
| TC-AUTH-14 | Malformed JSON body returns 400; server remains operational | Backend API |
| TC-AUTH-15 | Frontend login form validation (required fields, format) | Frontend unit |
| TC-AUTH-16 | Successful login stores session and navigates to the role dashboard | Frontend integration |
| TC-AUTH-17 | Invalid credentials, role mismatch and network errors surface clear messages | Frontend unit |
| TC-AUTH-18 | Login button is disabled while the request is in flight | Frontend unit |

### 14.4 EMS-FR-04 – Role-specific interface and route protection

| TC ID | Description | Level |
|-------|-------------|-------|
| TC-AUTH-19 | Each role can reach its own dashboard (200) | Backend API |
| TC-AUTH-20 | A role cannot reach the other role’s dashboard (403) | Backend API |
| TC-AUTH-21 | Missing, malformed, tampered, expired or wrongly-signed tokens yield 401 | Backend API |
| TC-AUTH-22 | ProtectedRoute redirects unauthenticated users to login | Frontend unit |
| TC-AUTH-23 | ProtectedRoute redirects wrong-role users to login | Frontend unit |
| TC-AUTH-24 | Valid token allows the protected page to render | Frontend unit |
| TC-AUTH-25 | Server rejection of the token clears the session and redirects | Frontend unit |
| TC-AUTH-26 | Backend unreachable shows a clear message without silent failure | Frontend unit |

### 14.5 EMS-FR-05 – Host past / upcoming events

| TC ID | Description | Level |
|-------|-------------|-------|
| TC-EVT-01 | Host can list upcoming events with default pagination and restricted projection | Backend unit + API |
| TC-EVT-02 | Host can list past events with requested pagination and descending date sort | Backend unit + API |
| TC-EVT-03 | Invalid or unsupported status / pagination query is rejected | Backend unit |
| TC-EVT-04 | Access control: only the owning host sees the list | Backend API |
| TC-EVT-05 | Host dashboard UI renders the event sections | Frontend unit |
| TC-EVT-06 | EventSection component handles loading, empty and error states | Frontend unit |
| TC-EVT-07 | Database-unavailable path returns a structured error | Backend API |

### 14.6 EMS-FR-06 – Host event details

| TC ID | Description | Level |
|-------|-------------|-------|
| TC-EVT-08 | Owner receives full event detail including registered-attendee count | Backend API |
| TC-EVT-09 | Non-owner or wrong role is denied | Backend API |
| TC-EVT-10 | Malformed event id is rejected | Backend API |
| TC-EVT-11 | Frontend Event Details page renders title, date, capacity, price and counts | Frontend unit |
| TC-EVT-12 | Formatting helpers produce human-readable date, price and capacity strings | Frontend unit |
| TC-EVT-13 | Unavailable database yields a recoverable error | Backend + Frontend |

### 14.7 EMS-FR-07 – Create and edit events

| TC ID | Description | Level |
|-------|-------------|-------|
| TC-EVT-14 | Host can create a valid event | Backend API + unit |
| TC-EVT-15 | Validation rejects missing/invalid title, date, capacity, price, etc. | Backend unit + API |
| TC-EVT-16 | Host can update an owned event; capacity cannot fall below current registrations | Backend API |
| TC-EVT-17 | Non-owner cannot edit another host’s event | Backend API |
| TC-EVT-18 | Frontend Create Event page submits validated data and shows success | Frontend unit |
| TC-EVT-19 | Frontend Edit Event page loads existing values and submits changes | Frontend unit |
| TC-EVT-20 | EventForm component validates fields and surfaces server validation errors | Frontend unit |
| TC-EVT-21 | Database-unavailable and network-error paths are handled | Backend + Frontend |

### 14.8 EMS-FR-08 – Attendee dashboard (partial)

| TC ID | Description | Level |
|-------|-------------|-------|
| TC-ATT-01 | Attendee dashboard shell renders without crashing | Frontend unit |
| TC-ATT-02 | Attendee event-details view renders core fields | Frontend unit |

*(Full history/upcoming lists and registration flows are deferred with FR-09/10/11.)*

### 14.9 EMS-FR-12 – Ratings and reviews

| TC ID | Description | Level |
|-------|-------------|-------|
| TC-REV-01 | Authenticated attendee can create a review for an eligible event | Backend unit + API |
| TC-REV-02 | Review summary (average rating, count, comments) is returned correctly | Backend unit + API |
| TC-REV-03 | Unauthenticated or wrong-role requests are rejected | Backend API |
| TC-REV-04 | Input validation rejects out-of-range ratings and empty comments where required | Backend unit |
| TC-REV-05 | Duplicate or otherwise invalid review attempts return structured errors | Backend API |

### 14.10 EMS-FR-14 – Error messages and retry

| TC ID | Description | Level |
|-------|-------------|-------|
| TC-ERR-01 | Unknown API route returns structured JSON 404 | Backend API |
| TC-ERR-02 | Missing / invalid token returns readable JSON 401 | Backend API |
| TC-ERR-03 | Wrong role returns readable JSON 403 without clearing a valid session | Backend API |
| TC-ERR-04 | Frontend ErrorMessage component displays the supplied text | Frontend unit |
| TC-ERR-05 | Login, signup and event forms show server or network errors and remain usable for retry | Frontend unit |

### 14.11 EMS-NFR-01 – Performance

| TC ID | Description | Level |
|-------|-------------|-------|
| TC-PERF-01 | Landing page load time ≤ 5 000 ms for each of N measured runs | Performance runner |
| TC-PERF-02 | API login endpoint p95 latency ≤ 500 ms over the configured sample | Performance runner |

### 14.12 EMS-NFR-03 – Responsive layout

| TC ID | Description | Level |
|-------|-------------|-------|
| TC-RESP-01 | Stylesheet contains the required mobile, tablet, desktop and wide media queries | Frontend unit |
| TC-RESP-02 | Root and major containers allow shrinking (min-width: 0) | Frontend unit |
| TC-RESP-03 | Live pages at widths 360, 768, 1024 and 1920 px show no horizontal overflow on `/`, `/login`, `/signup` | Responsive runner |

### 14.13 EMS-NFR-05 – Configuration

| TC ID | Description | Level |
|-------|-------------|-------|
| TC-CFG-01 | PORT, MONGODB_URI, SQLITE_PATH and JWT_SECRET are read from environment / `.env` | Backend unit |
| TC-CFG-02 | Sensible defaults are used when environment values are absent | Backend unit |
| TC-CFG-03 | MongoDB connection helper builds a correct URI for the test database | Backend unit |

### 14.14 Security (cross-cutting)

| TC ID | Description | Level |
|-------|-------------|-------|
| TC-SEC-01 | (covered by TC-AUTH-02 / TC-AUTH-03) Passwords are salted bcrypt hashes | Backend |
| TC-SEC-02 | (covered by TC-AUTH-10 / TC-AUTH-21) JWT lifetime and rejection of bad tokens | Backend |
| TC-SEC-03 | (covered by TC-AUTH-13 / TC-AUTH-19 / TC-AUTH-20) Role-based access control | Backend + Frontend |

---

## 15. Test Metrics & Reporting

**Metrics collected:**

- Number and percentage of planned test cases executed / passed / failed.
- Statement, branch, function and line coverage for backend and for frontend.
- Performance measurements (max page load, API p95).
- Responsive pass/fail matrix.

**Reports:**

1. `unit-test-report.md` – combined backend unit + frontend component results  
2. `performance-report.md` – page-load and API latency results  
3. `branch-coverage-report.md` – combined branch coverage  
4. `code-coverage-report.md` – combined statement / function / line coverage  
5. `system-acceptance-report.md` – full functional + responsive acceptance run  

Temporary HTML/LCOV artefacts have been written under `tests/reports/coverage-*-temp/` for inspection; they are not part of the five required deliverables.

---

## 16. Approvals

| Role | Name | Signature/Date |
|------|------|----------------|
| Project Manager | Piya Banerjee | Piya / 28.9.26 |