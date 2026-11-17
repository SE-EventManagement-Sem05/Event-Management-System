# Software Test Plan (STP): Event Management System

| | |
|---|---|
| **Project** | Event Management System |
| **Version** | 1.2 |
| **Authors** | Piya, Sharanya, Ananya |
| **Date** | 28-09-2026 (v1.0), 08-11-2026 (v1.1), 17-11-2026 (v1.2) |
| **Status** | Updated test plan tracability; execution status is recorded separately in test reports |

---

## 1. Introduction

**Purpose:** This document defines the test plan for the Event Management System (EMS). It identifies the test scope, test items, strategy, environment, responsibilities, risks, traceability, and test cases. Each test case specifies its own entry conditions and exit conditions so that readiness and completion can be assessed at the level of an individual test rather than inferred from a requirement-level paragraph.

**Scope:** Testing covers the implemented frontend, backend, API, database interactions, authentication, role-based access, host and attendee event workflows, event registration, simulated payment, reviews, error handling, configuration, performance, responsive behaviour, and selected security and reliability controls. The plan distinguishes implemented automated tests, manual tests, and requirements for which evidence is not currently present. A requirement must not be marked as verified solely because a related page or neighbouring feature has been tested.

**References:**
- EMS Software Requirements Specification (SRS) v1.0.
- EMS Software Architecture and Design Specification (SAD) v1.0.
- Automated test source files under `tests/` and supporting test files under `backend/tests/`.
- Test execution and requirement-specific reports under `tests/reports/`.

**Definitions:**

| Term | Meaning |
|---|---|
| EMS | Event Management System |
| JWT | JSON Web Token |
| RBAC | Role-Based Access Control |
| SRS | Software Requirements Specification |
| SAD | Software Architecture and Design Specification |
| RTM | Requirements Traceability Matrix |
| TC | Test Case |
| FR | Functional Requirement |
| NFR | Non-Functional Requirement |
| SEC | Security Requirement |
| API | Application Programming Interface |
| p95 | 95th percentile |
| mins | minutes |

---

## 2. Test Items

| Test item | Primary location | Planned / available test suites |
|---|---|---|
| Frontend pages, components and utilities | `frontend/src` | `tests/frontend/*.test.jsx`, `tests/frontend/*.test.js` |
| Authentication, signup, login, JWT and RBAC | `backend/server.js`, `backend/db.js` and authentication modules | `tests/backend/auth.test.js`, `tests/backend/login.test.js`, `tests/backend/errorResponses.api.test.js`; frontend `Signup`, `Login`, `ProtectedRoute`, `auth` and `loginFlow` suites |
| Host event listing and dashboard | Host event controllers, models and frontend pages | `tests/backend/hostEvents*.test.js`, `tests/backend/eventController.unit.test.js`, `tests/frontend/HostDashboard.test.jsx`, `tests/frontend/EventSection.test.jsx` |
| Host event details | Event controller and event details page | `tests/backend/eventDetails*.test.js`, `tests/backend/requirements-verification.test.js`, `tests/frontend/EventDetails.test.jsx`, `tests/frontend/eventFormat.test.js` |
| Event creation and editing | Event controller, validators, models and forms | `tests/backend/eventManagement*.test.js`, `tests/backend/eventController.unit.test.js`, `tests/frontend/CreateEvent.test.jsx`, `tests/frontend/EditEvent.test.jsx`, `tests/frontend/EventForm.test.jsx`, `tests/frontend/eventForm.test.js` |
| Attendee event listing and search | Attendee event API and dashboard | `backend/tests/attendeeEvents.api.test.js`, `backend/tests/attendeeEventSearch.api.test.js`, `tests/frontend/AttendeeDashboard.test.jsx`, `tests/frontend/events.test.js` |
| Event registration | Registration API and attendee workflow | `backend/tests/registration.api.test.js` |
| Simulated payment | Payment controller and API | `tests/backend/payment.api.test.js`, `tests/backend/paymentController.unit.test.js`; manual UI cases are separately identified |
| Ratings and reviews | Review controller, model and attendee event details | `tests/backend/reviewController.unit.test.js`, `tests/backend/reviews.api.test.js`, `tests/frontend/AttendeeEventDetails.test.jsx` |
| Logout and session handling | Frontend session utilities and attendee dashboard | `tests/frontend/AttendeeDashboard.test.jsx`, `tests/frontend/auth.test.js` |
| API error handling | Backend middleware/controllers and frontend error component | `tests/backend/errorResponses.api.test.js`, `tests/backend/requirements-verification.test.js`, `tests/frontend/ErrorMessage.test.jsx` and form error tests |
| Configuration and database connection | Backend config, environment and MongoDB helpers | `tests/backend/config.unit.test.js`, `tests/backend/envConfig.test.js`, `tests/backend/mongo.unit.test.js` |
| Performance | Running frontend and backend | `tests/performance/run-performance.mjs`, `tests/performance/api-load-test.js`; login timing assertion in `tests/backend/login.test.js` |
| Responsive layout | Frontend styles and running pages | `tests/frontend/responsive.test.js`, `tests/responsive/verify-responsive.mjs` |
| Test execution and coverage | Test runners and configurations | `tests/scripts/*.sh`, `tests/configs/*` |

Supporting fixtures and helpers under `backend/tests/` (including `setupEnv.js`, `helpers.js`, database tools, MongoDB URI resolution and test-server utilities) support test execution. They are not independent product test cases.

---

## 3. Features to be Tested

The following identifiers are taken from the SRS. The implementation and test evidence status is specified in Sections 13 and 14.

| ID | Feature / requirement |
|---|---|
| EMS-FR-01 | Landing page with signup and login options |
| EMS-FR-02 | Signup as Host or Attendee |
| EMS-FR-03 | Login according to role; issue JWT after successful authentication |
| EMS-FR-04 | Provide the interface appropriate to the authenticated role |
| EMS-FR-05 | Host can view past and upcoming events |
| EMS-FR-06 | Host can view event details |
| EMS-FR-07 | Host can create and edit events |
| EMS-FR-08 | Attendee can view past and upcoming events |
| EMS-FR-09 | Attendee can search and filter events |
| EMS-FR-10 | Attendee can register for an event |
| EMS-FR-11 | Simulated payment records the transaction |
| EMS-FR-12 | Rating and review can be provided |
| EMS-FR-13 | User can log out from an authenticated page |
| EMS-FR-14 | Clear error messages and retry/recovery for failure situations |
| EMS-NFR-01 | Performance: page load ≤ 5 seconds; 95% of API calls ≤ 500 ms |
| EMS-NFR-02 | Usability: a first-time user can complete signup/login within 2 minutes without external aid |
| EMS-NFR-03 | Compatibility/responsiveness: supported Chromium browser widths from 360 px to 1920 px |
| EMS-NFR-04 | Reliability: recovery from failure without restarting the application |
| EMS-NFR-05 | Configurability: MongoDB URI, port, SQLite path and JWT secret are read from environment configuration |
| EMS-NFR-06 | Efficiency: indexed queries, paginated lists and no unbounded caching |
| EMS-SEC-01 | Passwords are stored as salted bcrypt hashes |
| EMS-SEC-02 | JWT expires within 60 minutes; invalid and expired tokens are rejected |
| EMS-SEC-03 | Server-side access control is enforced according to role |
| EMS-SEC-04 | HTTP is utilised throughout, as stated in the SRS |
| EMS-SEC-05 | Input is validated and sanitised |
| EMS-SEC-06 | Login is locked out after 5 failures for 15 minutes |

---

## 4. Features Not to be Tested

- Actual payment gateway integration or transfer of real money; payment behaviour is simulated.
- Browsers older than two released versions.
- Internal correctness of third-party libraries (MERN stack components, bcrypt, JWT library, test frameworks).
- SMS, email, or other notification services not included in the implemented requirements.
- Production-scale capacity beyond the explicitly defined test loads and test environment.
- Security properties that cannot be established from the available implementation or test evidence are not to be presumed verified; they are recorded as limitations or deferred items.

---

## 5. Test Approach / Strategy

### Levels

- **Unit Testing:** Test individual frontend components, utility functions, backend controllers, configuration functions, validation logic and database-related helpers in isolation.
- **Integration Testing:** Test interactions among the frontend, backend APIs, authentication storage, MongoDB-backed event data and the simulated payment/review workflows.
- **System Testing:** Test complete user journeys and API behaviour across the application, including authentication, host and attendee workflows, event discovery, registration, simulated payment, reviews, logout and error recovery.
- **Acceptance Testing:** Assess whether the implemented behaviour satisfies the SRS acceptance criteria. Manual usability and browser-based acceptance checks are kept distinct from automated unit/API checks.

### Types

- **Functional Testing:** Verify the user-visible and API behaviour for each functional requirement.
- **Regression Testing:** Re-run affected suites after changes and run the applicable consolidated suites before release.
- **Performance Testing:** Measure the exact operations and thresholds stated in the applicable SRS requirement. Do not generalise a measurement from one endpoint to all endpoints.
- **Usability Testing:** Observe first-time users completing signup and login without external assistance; record individual elapsed times and any assistance or blocking issue.
- **Security Testing:** Verify password hashing, JWT signing/expiry/rejection, server-side role checks and input validation where covered by tests.
- **Error Handling Testing:** Verify structured errors, readable user feedback, retry behaviour and continued server operation after recoverable failures.
- **Compatibility / Responsive Testing:** Verify layout and horizontal overflow at the specified viewport widths in the supported browser.
- **Reliability Testing:** Verify recovery and concurrent request behaviour only for the scenarios and loads explicitly exercised by the test suites.

### Test-case entry and exit conditions

There are no blanket entry or exit paragraphs for all test cases. The entry condition and exit condition are specified separately in every test-case row in Section 14.

For interpretation:
- **Entry condition** states the specific state, data, user role, environment or prerequisite that must exist immediately before that case is run.
- **Exit condition** states the observable expected result that must be achieved for that case to pass. A case fails if the result is not achieved, the result cannot be observed, or the case cannot be completed because of an environmental blocker.
- Shared environment setup (installed dependencies, configured test database, running server, browser availability) is a test-environment prerequisite, not a substitute for a case-specific entry condition.
- A blocked or not-run case is not a pass. Record it as **Blocked** or **Not Run**, with the reason, rather than treating it as passed.
- A test case may be marked **Passed** only when its stated exit condition is met and the execution evidence is retained.

### 5.1 Security Validation

- **Password Protection:** Verify that passwords are stored as salted bcrypt hashes and that plaintext passwords are not returned in API responses or stored in the authentication database.
- **JWT Validation:** Verify that protected APIs reject missing, malformed, tampered, expired and wrongly signed tokens with an authentication response rather than an internal server error.
- **JWT Expiration:** Verify the configured token lifetime and rejection of expired tokens.
- **Role-Based Authorization:** Verify that Host and Attendee permissions are enforced by the backend, not solely by frontend route guards.
- **Secret Protection:** Verify that the server requires the JWT secret and that secrets are not returned in API payloads. Client-bundle/log inspection is not claimed unless an explicit test is executed.
- **Input Validation:** Verify malformed, missing, out-of-range and unexpected values are rejected or handled according to the applicable API contract.
- **Deferred security controls:** EMS-SEC-04 and EMS-SEC-06 require separate explicit evidence. They must not be marked verified by the authentication tests listed above.

---

## 6. Test Environment

**Hardware**

- Desktop/laptop computer for development and test execution.
- Mobile device or browser emulation for responsive checks.
- Stable network connection.

**Software**

- Event Management System frontend and backend versions under test.
- React frontend.
- Node.js with Express backend.
- MongoDB test database.
- SQLite authentication database.
- Supported Chromium browser (Google Chrome or Microsoft Edge).
- Node.js/npm versions compatible with the project dependencies.

**Tools**

- Jest for backend unit/API/integration tests.
- Vitest and React Testing Library for frontend tests.
- Supertest for HTTP/API assertions.
- Playwright for live responsive/performance browser checks where used by the runner.
- Browser Developer Tools for manual browser and network inspection.
- Shell scripts under `tests/scripts/` for repeatable execution.
- Issue tracker or equivalent defect log.

**Test Data**

- Distinct Host and Attendee accounts.
- Valid, invalid, duplicate and boundary-value signup/login inputs.
- Events with upcoming and past dates, different prices, capacities and categories.
- Events with zero, partial and full registrations.
- Registered, unregistered and duplicate attendee/event combinations.
- Successful, failed and duplicate simulated payment records.
- Reviews with valid and invalid ratings/comments.
- Missing, malformed, invalid, expired and role-mismatched tokens.
- Controlled database-unavailable and network-failure conditions where the test harness supports them.

**Environment controls**

- Use a dedicated test database/URI. Do not run destructive test setup against production data.
- Keep secrets in environment variables or a test `.env` file excluded from version control.
- Reset or isolate test data between suites/cases where required.
- Record browser, viewport, test database, build/version and execution date for manual/system-level evidence.
- Do not use real payment credentials or process real payments.

---

## 7. Test Schedule

| Milestone | Date |
|-----------|------|
| Test case design | Oct 15, 2026, Reiteration: Nov 8, 2026 |
| Test environment setup | Oct 15, 2026, Modified: Nov 8, 2026 |
| Test execution start | Oct 15, 2026 |
| Functional testing completion | Nov 12, 2026 |
| Security and performance testing | Oct 15, 2026 |
| Test execution end | Nov 12, 2026 |
| Final test summary | Nov 12, 2026 |

---

## 8. Test Deliverables

The following deliverables are maintained as evidence of test planning and execution:

- Software Test Plan (this document).
- Individual test cases and automated test source files.
- Test execution results and defect records.
- Requirements Traceability Matrix (RTM).
- Test summary / acceptance report.
- Reports under `tests/reports/`, including:
  1. `unit-test-report.md`
  2. `performance-report.md`
  3. `branch-coverage-report.md`
  4. `code-coverage-report.md`
  5. `system-acceptance-report.md`
- Requirement-specific reports where applicable, including FR-11 and NFR-02 evidence.

A report is evidence only for the tests and environment it explicitly records. A generated report does not establish that unexecuted cases or untested requirements passed.

---

## 9. Roles and Responsibilities

| Role | Name | Responsibility |
|---|---|---|
| QA Lead | Piya | Maintain the test plan, coordinate test cycles, review traceability and test results |
| Test Engineer | Ananya, Sharanya | Design and execute assigned test cases, retain evidence and report defects |
| Developer | Ananya, Sharanya | Support testability, investigate defects and implement fixes |
| Product Owner | Piya | Review acceptance evidence, assess residual risks and approve release readiness |

---

## 10. Risks and Mitigation

| Risk | Mitigation |
|---|---|
| Delay in receiving a stable build | Prepare test cases and test data before the build is ready; record build/version for each execution |
| Backend or database unavailable | Use the configured test database and test-server helpers; distinguish expected failure-path tests from environment outages |
| Incorrect or incomplete test data | Prepare role-specific and boundary-value fixtures; isolate or reset data between tests |
| Requirement changes during development | Update affected test cases, expected results and traceability links; rerun impacted regression suites |
| Authentication defects affect dependent features | Execute authentication and authorization tests before dependent protected workflows |
| Simulated payment failures affect registration/payment testing | Keep success, failure, retry, duplicate and free-event scenarios separate |
| Test names and plan IDs drift apart | Maintain a one-to-one traceability mapping between test-plan IDs and source test names; update both together |
| Manual usability sample is too small to generalise | Report participant count and individual times; describe results as observed sample evidence, not a universal guarantee |
| Performance measurements are environment-dependent | Record environment, sample size, warm-up policy and measured endpoint; avoid extrapolating beyond tested load |
| Partial test execution is reported as full acceptance | Report executed, passed, failed, blocked and not-run cases separately |

---

## 11. Assumptions & Dependencies

**Assumptions**

- The application build under test is deployable in the configured local/test environment.
- MongoDB and SQLite are configured as required by the relevant backend modules.
- Required test accounts and event data can be created through fixtures or supported setup helpers.
- JWT generation and verification are available through the backend implementation.
- Test secrets and database connection strings are supplied through environment configuration.
- A supported browser and stable network are available for browser-based tests.
- Manual usability participants are first-time users of the application and are not given task assistance during timed observations.

**Dependencies**

- React frontend and its installed dependencies.
- Node.js / Express backend and its installed dependencies.
- MongoDB test instance and SQLite database.
- Test configuration and environment variables.
- Jest, Vitest, React Testing Library, Supertest and Playwright as used by the suites.
- Test scripts, fixtures and helpers under `tests/` and `backend/tests/`.

---

## 12. Suspension & Resumption Criteria

**Suspend an affected test or test suite if:**

- Its required test environment or dependency is unavailable.
- A critical defect prevents meaningful execution of the case.
- Test data is corrupted or cannot be isolated safely.
- The application build changes during execution such that results are no longer attributable to a single build.
- The test harness fails before the product behaviour can be evaluated.

**Resume an affected test or suite when:**

- The required environment and dependencies are restored.
- The blocking defect is fixed or an approved workaround makes the case executable.
- Valid test data is recreated or restored.
- The build/version under test is identified and stable.
- The case is rerun from its own entry condition; a previously blocked execution is not retroactively marked passed.

---

## 13. Test Case Management & Traceability

Each test case in Section 14 has an individual entry condition and exit condition. Source test names are the executable evidence; test-plan IDs provide stable requirement-level traceability. Where one source test verifies more than one requirement, the mapping is explicitly noted. Where a requirement has no matching test, it is marked **Not covered** or **Partially covered**, not passed.

| Requirement | Test case IDs | Primary suite / evidence | Coverage status in the supplied project files |
|---|---|---|---|
| EMS-FR-01 | TC-UI-01 to TC-UI-05 | `Landing.test.jsx`, `Navbar.test.jsx`, `App.test.jsx` | Automated frontend coverage |
| EMS-FR-02 | TC-AUTH-01 to TC-AUTH-08 | `tests/backend/auth.test.js`, `tests/frontend/Signup.test.jsx` | Automated backend and frontend coverage |
| EMS-FR-03 | TC-AUTH-09 to TC-AUTH-18 | `tests/backend/auth.test.js`, `tests/backend/login.test.js`, `tests/frontend/Login.test.jsx`, `loginFlow.test.jsx`, `auth.test.js` | Automated backend and frontend coverage |
| EMS-FR-04 | TC-AUTH-19 to TC-AUTH-26 | `tests/backend/auth.test.js`, `errorResponses.api.test.js`, `ProtectedRoute.test.jsx` | Automated API and frontend coverage |
| EMS-FR-05 | TC-EVT-01 to TC-EVT-07; TC-ANL-01 to TC-ANL-04 | `hostEvents*.test.js`, `eventController.unit.test.js`, `requirements-verification.test.js`, `HostDashboard.test.jsx`, `EventSection.test.jsx` | Automated coverage for listed host-list/dashboard behaviours |
| EMS-FR-06 | TC-EVT-08 to TC-EVT-13 | `eventDetails*.test.js`, `EventDetails.test.jsx`, `eventFormat.test.js`, `requirements-verification.test.js` | Automated coverage for listed details behaviours |
| EMS-FR-07 | TC-EVT-14 to TC-EVT-21 | `eventManagement*.test.js`, `eventController.unit.test.js`, `CreateEvent.test.jsx`, `EditEvent.test.jsx`, `EventForm.test.jsx`, `eventForm.test.js` | Automated backend and frontend coverage |
| EMS-FR-08 | TC-ATT-01 to TC-ATT-06 | `backend/tests/attendeeEvents.api.test.js`, `AttendeeDashboard.test.jsx` | API listing and dashboard coverage; confirm any additional UI list behaviour separately |
| EMS-FR-09 | TC-SEARCH-01 to TC-SEARCH-08 | `backend/tests/attendeeEventSearch.api.test.js`, `tests/frontend/events.test.js` | Backend search/filter API coverage; frontend utility coverage |
| EMS-FR-10 | TC-REG-01 to TC-REG-07 | `backend/tests/registration.api.test.js` | Backend API coverage; a complete browser journey is not established by this API suite alone |
| EMS-FR-11 | TC-PAY-01 to TC-PAY-15; TC-PAY-UI-01 to TC-PAY-06 | `tests/backend/payment.api.test.js`, `paymentController.unit.test.js`, `tests/reports/FR11_Test_Case_Report.md` | Backend API/controller coverage; UI cases are manual scenarios and require execution evidence |
| EMS-FR-12 | TC-REV-01 to TC-REV-05; TC-REV-UI-01 to TC-REV-03 | `reviewController.unit.test.js`, `reviews.api.test.js`, `AttendeeEventDetails.test.jsx` | Backend and partial frontend coverage |
| EMS-FR-13 | TC-LOGOUT-01 to TC-LOGOUT-03 | `AttendeeDashboard.test.jsx`, `tests/frontend/auth.test.js` | Frontend session-clear coverage; no separate server-side logout endpoint is claimed |
| EMS-FR-14 | TC-ERR-01 to TC-ERR-08 | `errorResponses.api.test.js`, `requirements-verification.test.js`, `ErrorMessage.test.jsx` and form error tests | Automated API and frontend error-path coverage |
| EMS-NFR-01 | TC-PERF-01 to TC-PERF-03 | `tests/performance/run-performance.mjs`, `api-load-test.js`, `login.test.js` | Page-load and login API measurements; broader API-wide p95 claim requires representative endpoint coverage |
| EMS-NFR-02 | TC-USE-01 | `tests/reports/NFR-02_User_Usability_Test_Report.md` and referenced demonstration video | Manual sample evidence; five recorded observations are not a statistically representative population |
| EMS-NFR-03 | TC-RESP-01 to TC-RESP-03 | `responsive.test.js`, `verify-responsive.mjs` | Automated stylesheet and live viewport checks for the listed pages and widths |
| EMS-NFR-04 | TC-REL-01 to TC-REL-05 | Error-path and concurrency tests in auth, host events, event details, event management and requirements-verification suites | Partial, scenario-specific reliability coverage; not a complete system-wide recovery proof |
| EMS-NFR-05 | TC-CFG-01 to TC-CFG-04 | `envConfig.test.js`, `config.unit.test.js`, `mongo.unit.test.js` | Automated configuration and MongoDB retry/configuration coverage |
| EMS-NFR-06 | TC-EFF-01 to TC-EFF-03 | Host event pagination/projection tests and event-list tests | Partial evidence for pagination/projection; database indexing and cache bounds are not established by these tests |
| EMS-SEC-01 | TC-SEC-01 | `auth.test.js`, `login.test.js` | Automated bcrypt-hash evidence |
| EMS-SEC-02 | TC-SEC-02 | `auth.test.js`, `login.test.js` | Automated JWT signature, lifetime and rejection evidence |
| EMS-SEC-03 | TC-SEC-03 | `auth.test.js`, `errorResponses.api.test.js`, `ProtectedRoute.test.jsx` | Automated backend role checks and frontend route behaviour |
| EMS-SEC-04 | TC-SEC-04 | No dedicated protocol verification test identified | Not covered by a dedicated test |
| EMS-SEC-05 | TC-SEC-05 | Signup, login, event, review and payment validation suites | Partially covered by input-validation tests; sanitisation claims are limited to the tested cases |
| EMS-SEC-06 | TC-SEC-06 | No dedicated lockout test identified | Not covered; requires explicit implementation/test evidence |

---

## 14. Planned Test Cases

**How to read the case tables:** Each row is an independently assessable test case. The **Entry condition** is checked before execution. The **Exit condition / expected result** is the pass criterion for that case. Test data should be isolated per case unless the row explicitly requires shared state. The source test file listed in Section 13 is the execution reference.

### 14.1 EMS-FR-01 – Landing page and navigation

| TC ID | Description / procedure | Level | Entry condition | Exit condition / expected result |
|---|---|---|---|---|
| TC-UI-01 | Open the landing page and inspect primary content and calls-to-action | Frontend unit | Landing page component is renderable with its normal test dependencies | Main purpose/content and primary calls-to-action render without runtime error |
| TC-UI-02 | Render the navigation bar and inspect logo, login, signup and section links | Frontend unit | Navigation component is mounted | Logo, Log in, Sign up and expected section links are present with correct destinations |
| TC-UI-03 | Open and close the mobile navigation menu; select a menu link | Frontend unit | Viewport is configured to the mobile breakpoint and menu is initially closed | Menu opens, closes, and closes after a link is selected; selected link has the expected destination |
| TC-UI-04 | Navigate directly to `/`, `/login` and `/signup` without a session | Frontend unit | No authenticated session exists; router is configured | Each public route renders without an authentication redirect |
| TC-UI-05 | Scroll the landing page and inspect navigation styling | Frontend unit | Landing page and navigation are mounted at the top of the page | Navigation appearance changes at the defined scroll state and returns appropriately when applicable |

### 14.2 EMS-FR-02 – Signup

| TC ID | Description / procedure | Level | Entry condition | Exit condition / expected result |
|---|---|---|---|---|
| TC-AUTH-01 | Submit valid signup details separately for an Attendee and a Host | Backend API | Test database is available; unique email addresses and valid role-specific payloads are prepared | Each valid request returns HTTP 201 and creates a user with the requested role |
| TC-AUTH-02 | Sign up and inspect the stored password value | Backend API | A new user can be created and the test can read the authentication record | Stored password is a bcrypt hash; it is not equal to the submitted plaintext password |
| TC-AUTH-03 | Create two users using the same plaintext password | Backend API | Two unique email addresses and the same valid password are available | Both stored hashes verify against the password but are different from each other, demonstrating salting |
| TC-AUTH-04 | Submit an email already registered, varying case and surrounding spaces | Backend API | A user with the normalized email already exists | Duplicate signup is rejected with HTTP 409; no duplicate account is created |
| TC-AUTH-05 | Submit injection-style text in permitted text fields and retrieve the saved record | Backend API | Test database is available and the payload contains controlled test strings | Input is handled as data; it does not execute as code or corrupt the database/schema |
| TC-AUTH-06 | Submit the frontend signup form empty and with invalid email, short password and mismatched confirmation | Frontend unit | Signup page is rendered and API calls are mocked | Each invalid input produces appropriate validation feedback and the API is not called |
| TC-AUTH-07 | Submit valid signup details through the frontend | Frontend unit | Signup page is rendered; API mock returns the expected success response | Validated fields are sent and success feedback is displayed |
| TC-AUTH-08 | Cause the signup request to fail at the network layer | Frontend unit | Signup page is rendered; API mock rejects the request | A clear recoverable error is displayed; entered values remain usable for retry and the page does not crash |

### 14.3 EMS-FR-03 – Login and JWT

| TC ID | Description / procedure | Level | Entry condition | Exit condition / expected result |
|---|---|---|---|---|
| TC-AUTH-09 | Submit valid credentials and the matching role to the login API | Backend API | A user exists with a valid bcrypt password hash | API returns success with a token and documented user object; no password or secret is returned |
| TC-AUTH-10 | Decode and verify a newly issued JWT | Backend API | Valid login credentials are available and the server test secret is configured | Token signature verifies with HS256; claims include the expected user ID and role; expiry is 60 minutes as specified |
| TC-AUTH-11 | Log in using email case/space variations and password case variations | Backend API | A valid account exists and test variants are prepared | Email matching is case/space-insensitive as implemented; password matching remains case-sensitive |
| TC-AUTH-12 | Attempt login with a wrong password and with an unknown email | Backend API | Server is available; both requests are syntactically valid | Both requests return the same generic HTTP 401 response and issue no token |
| TC-AUTH-13 | Submit correct credentials with a role that does not match the account | Backend API | A valid account exists for the other role | API returns HTTP 403 and issues no token |
| TC-AUTH-14 | Send malformed JSON to the login endpoint, then send a valid login request | Backend API | Test server is running and valid credentials exist | Malformed request returns HTTP 400; subsequent valid login succeeds, showing server remains responsive |
| TC-AUTH-15 | Submit the frontend login form empty and with malformed email | Frontend unit | Login page is rendered and API is mocked | Required-field/format messages are shown and invalid submissions do not call the API |
| TC-AUTH-16 | Log in successfully as Host and as Attendee through the frontend | Frontend integration | Role-specific test accounts are available; API returns valid token and user data for each role | Session is stored and navigation reaches the dashboard corresponding to the role returned by the server |
| TC-AUTH-17 | Exercise invalid credentials, role mismatch, malformed success response and network failure in the login UI | Frontend unit | Login page is rendered; API responses/rejections can be controlled | Each failure produces a readable message; no invalid session is stored; user can retry |
| TC-AUTH-18 | Submit the login form and inspect the submit control while request is pending | Frontend unit | Login page is rendered; API mock is held pending | Submit button is disabled while request is in flight and is restored after completion |

### 14.4 EMS-FR-04 – Role-specific interface and route protection

| TC ID | Description / procedure | Level | Entry condition | Exit condition / expected result |
|---|---|---|---|---|
| TC-AUTH-19 | Call the Host dashboard API with a valid Host token and the Attendee dashboard API with a valid Attendee token | Backend API | Both role accounts and valid tokens exist | Each role receives HTTP 200 from its permitted dashboard endpoint |
| TC-AUTH-20 | Use a Host token on an Attendee-only endpoint and an Attendee token on a Host-only endpoint | Backend API | Valid tokens for both roles exist | Each cross-role request is rejected with HTTP 403 and protected data is not disclosed |
| TC-AUTH-21 | Call a protected endpoint with missing, malformed, tampered, expired and wrongly signed tokens | Backend API | Protected endpoint is available; token variants are prepared | Every invalid token is rejected with HTTP 401; no request produces an authorization bypass or HTTP 500 |
| TC-AUTH-22 | Open a protected frontend route with no session | Frontend unit | Session storage is empty | ProtectedRoute redirects to login and does not render protected content |
| TC-AUTH-23 | Open a role-protected route with a valid session for the wrong role | Frontend unit | A valid session exists for the non-permitted role | ProtectedRoute redirects according to the implemented route policy and protected content is not rendered |
| TC-AUTH-24 | Open a protected route with a valid session accepted by the backend | Frontend unit | Valid token and matching role are present; API mock accepts token | Protected page is rendered |
| TC-AUTH-25 | Make the backend reject the stored token as invalid/expired | Frontend unit | A session exists and protected route validation is invoked | Session is cleared and user is redirected to login with appropriate feedback |
| TC-AUTH-26 | Make the backend unavailable during protected-route validation | Frontend unit | A session exists; API mock rejects with a network error | A clear availability message is shown; the application does not fail silently or crash |

### 14.5 EMS-FR-05 – Host past / upcoming events

| TC ID | Description / procedure | Level | Entry condition | Exit condition / expected result |
|---|---|---|---|---|
| TC-EVT-01 | Request the Host upcoming-event list without explicit pagination parameters | Backend unit + API | MongoDB test database is available; Host has upcoming events | Only the authenticated Host's upcoming events are returned using documented default pagination and restricted fields |
| TC-EVT-02 | Request the Host past-event list with pagination parameters | Backend unit + API | Host has past events spanning multiple pages | Only the Host's past events are returned in descending date order with requested pagination |
| TC-EVT-03 | Submit unsupported status and invalid pagination values | Backend unit | Host token and event-list endpoint are available | Invalid query parameters are rejected with a structured client error; no unintended query is executed |
| TC-EVT-04 | Request the event list using another Host's identity in query/body manipulation | Backend API | Two Host accounts have separate event records | Response contains only events owned by the authenticated Host; client-supplied host identity cannot override authorization |
| TC-EVT-05 | Render the Host dashboard and inspect Upcoming/Past sections | Frontend unit | Host dashboard is mounted with API responses available | Dashboard renders the event sections and allows the user to switch between them |
| TC-EVT-06 | Render EventSection for loading, empty, populated and error states | Frontend unit | EventSection is mounted; each state can be supplied through controlled props/API mocks | Correct loading/empty/list/error UI is shown; retry action invokes the handler and recovers when the API succeeds |
| TC-EVT-07 | Make MongoDB unavailable and request Host events | Backend API | Test server is running; database availability can be controlled | API returns the documented structured service-unavailable response (HTTP 503); no unhandled crash occurs |

### 14.6 EMS-FR-06 – Host event details

| TC ID | Description / procedure | Level | Entry condition | Exit condition / expected result |
|---|---|---|---|---|
| TC-EVT-08 | Request details for an event owned by the authenticated Host | Backend API | Host owns an existing event; registrations/reviews are seeded where required | HTTP 200 response contains documented event details and the correct registered-attendee count |
| TC-EVT-09 | Request another Host's event as a non-owner or as an Attendee | Backend API | Event exists and belongs to a different Host; caller has a valid but unauthorized role/token | Request is denied (403 or the specified authorization response) and event data is not disclosed |
| TC-EVT-10 | Request details using a malformed event identifier | Backend API | Authenticated Host token is valid | API rejects the malformed identifier with a client error and does not query an unintended record |
| TC-EVT-11 | Render the Host Event Details page with a populated event response | Frontend unit | Event details page is mounted with a successful API response | Title, description, date/time, venue, price, capacity and registration count render accurately |
| TC-EVT-12 | Exercise event date/price/capacity formatting helpers with valid and invalid values | Frontend unit | Formatting utilities are importable and representative values are prepared | Helpers return readable formatted values and handle invalid/missing values without throwing |
| TC-EVT-13 | Make the event database unavailable while loading event details, then restore it | Backend + Frontend | Event exists; test harness can simulate database/network failure and subsequent recovery | Backend returns a structured availability error; UI displays a recoverable message and a retry succeeds after service restoration |

### 14.7 EMS-FR-07 – Create and edit events

| TC ID | Description / procedure | Level | Entry condition | Exit condition / expected result |
|---|---|---|---|---|
| TC-EVT-14 | Submit a valid event creation request as a Host | Backend API + unit | Authenticated Host exists; database is available; event payload satisfies validation | Event is created with HTTP 201 and ownership is assigned from the authenticated user, not client-supplied identity |
| TC-EVT-15 | Submit event creation/update payloads with missing, malformed and boundary-value fields | Backend unit + API | Authenticated Host and validation endpoint are available | Invalid fields produce structured field errors and no invalid record is persisted; valid boundary values are accepted |
| TC-EVT-16 | Update an event owned by the Host, including a capacity reduction attempt | Backend API | Host owns an event; registration count is known | Valid changes are persisted and reflected in subsequent detail/list reads; capacity cannot be reduced below current registrations |
| TC-EVT-17 | Attempt to update another Host's event | Backend API | Event belongs to a different Host; caller is authenticated | Request is rejected with HTTP 403 and original event remains unchanged |
| TC-EVT-18 | Create an event through the frontend form with valid data | Frontend unit | Create Event page is mounted; API mock returns success | Validated/cleaned payload is submitted and success feedback/navigation is shown |
| TC-EVT-19 | Open Edit Event for an owned event, change fields and save | Frontend unit | Event exists and is owned by the logged-in Host; API mock returns event data | Form is pre-filled; update request contains edited values; success notice/details navigation is shown |
| TC-EVT-20 | Exercise required-field, past-date, field-level server-error and general-error behaviour in EventForm | Frontend unit | EventForm is mounted in create/edit mode as applicable | Invalid values block submission; field/general errors are visible; editing a field clears its relevant error; valid values produce the cleaned payload |
| TC-EVT-21 | Cause database and network failures during create/update operations | Backend + Frontend | Host is authenticated; create/edit form is available; failure can be simulated | API/UI show a recoverable error, preserve entered values where applicable and permit retry after recovery |

### 14.8 EMS-FR-08 – Attendee past / upcoming events

| TC ID | Description / procedure | Level | Entry condition | Exit condition / expected result |
|---|---|---|---|---|
| TC-ATT-01 | Request upcoming events as an authenticated Attendee | Backend API | Attendee token is valid; upcoming events exist in test database | API returns only upcoming events in ascending date order with the documented response structure |
| TC-ATT-02 | Request past events as an authenticated Attendee | Backend API | Attendee token is valid; past events exist | API returns past events in descending date order |
| TC-ATT-03 | Request attendee event lists using pagination | Backend API | More events exist than one page can contain | Page contents, page metadata and ordering are correct; records are not duplicated across pages |
| TC-ATT-04 | Omit or supply an unsupported event-list status | Backend API | Attendee token is valid | Missing/invalid status is rejected with a structured validation response |
| TC-ATT-05 | Supply invalid page and page-size values | Backend API | Attendee token is valid | Invalid pagination parameters are rejected; server does not return an uncontrolled/unbounded result |
| TC-ATT-06 | Request attendee event listing without a token and with a Host token | Backend API | Endpoint is available; missing and Host credentials are prepared | Unauthenticated request is rejected with 401 and Host request is rejected with 403 |

### 14.9 EMS-FR-09 – Attendee search and filtering

| TC ID | Description / procedure | Level | Entry condition | Exit condition / expected result |
|---|---|---|---|---|
| TC-SEARCH-01 | Search events by location | Backend API | Authenticated Attendee; seeded events include matching and non-matching locations | Only events matching the requested location are returned |
| TC-SEARCH-02 | Search events by interest keyword | Backend API | Authenticated Attendee; event records contain known searchable text | Results include matching events and exclude unrelated events |
| TC-SEARCH-03 | Filter events by category | Backend API | Authenticated Attendee; events exist in multiple categories | Returned events match the requested category |
| TC-SEARCH-04 | Combine location and category filters | Backend API | Authenticated Attendee; fixtures include combinations that match and do not match both filters | Results satisfy both filters rather than either filter alone |
| TC-SEARCH-05 | Search using criteria that match no events | Backend API | Authenticated Attendee; query is valid and has no matching fixture | API returns a successful empty result, not an error |
| TC-SEARCH-06 | Submit search filters exceeding permitted input lengths | Backend API | Authenticated Attendee; oversized filter values are prepared | API rejects invalid filter lengths with a structured client error |
| TC-SEARCH-07 | Search without authentication | Backend API | Search endpoint is available; no token is supplied | API returns HTTP 401 and no event data |
| TC-SEARCH-08 | Search using a Host token | Backend API | Valid Host token exists | API returns HTTP 403 and does not expose attendee search results |

### 14.10 EMS-FR-10 – Event registration

| TC ID | Description / procedure | Level | Entry condition | Exit condition / expected result |
|---|---|---|---|---|
| TC-REG-01 | Register an authenticated Attendee for an upcoming event with available capacity | Backend API | Attendee is authenticated; event is upcoming and has capacity | Registration is created and success response identifies the registration |
| TC-REG-02 | Attempt to register the same Attendee for the same event twice | Backend API | A registration for that attendee/event pair already exists | Duplicate registration is rejected; only one registration remains |
| TC-REG-03 | Attempt registration when event capacity is full | Backend API | Event is upcoming and registered count equals capacity | Registration is rejected and registered count does not exceed capacity |
| TC-REG-04 | Attempt registration for a past event | Backend API | Event date is in the past and Attendee is authenticated | Registration is rejected and no registration record is created |
| TC-REG-05 | Attempt registration without authentication | Backend API | Registration endpoint is available; no token is supplied | API returns HTTP 401 and no registration is created |
| TC-REG-06 | Attempt registration using a Host account | Backend API | Valid Host token exists | API rejects the request with HTTP 403 and no attendee registration is created |
| TC-REG-07 | Attempt registration for an unknown event identifier | Backend API | Attendee is authenticated; identifier does not correspond to an event | API returns HTTP 404 and no registration is created |

### 14.11 EMS-FR-11 – Simulated payment

| TC ID | Description / procedure | Level | Entry condition | Exit condition / expected result |
|---|---|---|---|---|
| TC-PAY-01 | Submit payment without authentication | Backend API | Payment endpoint is available; no token is supplied | Request is rejected with HTTP 401; no payment record is created |
| TC-PAY-02 | Submit payment using a Host account | Backend API | Valid Host token exists | Request is rejected with HTTP 403; no payment record is created |
| TC-PAY-03 | Submit payment as an Attendee who is not registered for the event | Backend API | Attendee is authenticated but has no registration for the event | Request is rejected with HTTP 403; no payment record is created |
| TC-PAY-04 | Submit payment with a malformed event ID | Backend API | Attendee token is valid | Request is rejected with the documented not-found/validation response; event lookup/payment creation does not proceed |
| TC-PAY-05 | Submit payment for a non-existent event | Backend API | Attendee token is valid; event ID is well-formed but absent | API returns HTTP 404; no payment record is created |
| TC-PAY-06 | Submit an unsupported or missing payment outcome | Backend API + unit | Valid event/registration context is prepared; invalid outcome values are supplied | API/controller rejects the outcome with HTTP 400; no payment record is created |
| TC-PAY-07 | Simulate a successful payment for a registered Attendee and paid event | Backend API + unit | Attendee is registered; event price is greater than zero; no successful payment exists | Successful payment record is created with correct event, registration, attendee, amount and transaction identifier |
| TC-PAY-08 | Simulate a failed payment | Backend API + unit | Attendee is registered for a paid event; no successful payment exists | Failed payment attempt is recorded and failure response is returned |
| TC-PAY-09 | Retry payment after a failed attempt | Backend API | A failed payment attempt exists and no successful payment exists | A subsequent attempt is permitted and produces its own outcome record |
| TC-PAY-10 | Attempt a second successful payment for the same registration/event | Backend API + unit | A successful payment already exists | Duplicate successful payment is rejected (HTTP 409); no second successful transaction is created |
| TC-PAY-11 | Attempt payment for a free event | Backend API + unit | Event price is zero or absent; Attendee context is otherwise valid | Payment is rejected/not required; no paid transaction is created |
| TC-PAY-12 | Attempt payment while the database is unavailable | Backend unit | Database connection is marked unavailable in the test harness | Controller returns HTTP 503 and does not attempt to create a payment |
| TC-PAY-13 | Verify payment controller processing with valid event and registration records | Backend unit | Controller receives valid authenticated Attendee, event and registration fixtures | Controller creates the expected payment record and returns the success status |
| TC-PAY-14 | Simulate an unexpected database error during payment creation | Backend unit | Valid payment context exists; payment persistence rejects unexpectedly | Controller returns HTTP 500 with safe error handling; internal error details are not exposed to the client |
| TC-PAY-15 | Simulate a duplicate-key database error during payment creation | Backend unit | Valid payment context exists; persistence returns duplicate-key error | Controller returns HTTP 409 and does not report a successful duplicate transaction |
| TC-PAY-UI-01 | Register for a paid event and inspect the checkout section | Manual UI | User is logged in as an Attendee; paid event is available for registration | Checkout/payment section appears after the required registration state |
| TC-PAY-UI-02 | Select the successful simulated payment outcome | Manual UI | Checkout section is displayed for a registered attendee | Success state and transaction details are displayed |
| TC-PAY-UI-03 | Select the failed simulated payment outcome | Manual UI | Checkout section is displayed and failed outcome is selectable | Failure message is displayed and no success state is shown |
| TC-PAY-UI-04 | Retry after a failed simulated payment | Manual UI | A failed payment attempt has been recorded | User can initiate another attempt; the UI reflects the new outcome |
| TC-PAY-UI-05 | Register for a free event | Manual UI | User is logged in as an Attendee; free event is available | Checkout/payment is not required or displayed as a paid step |
| TC-PAY-UI-06 | Attempt repeated payment submission while processing | Manual UI | Payment submission is in progress | Repeated submission is prevented/disabled until the current attempt completes |

### 14.12 EMS-FR-12 – Ratings and reviews

| TC ID | Description / procedure | Level | Entry condition | Exit condition / expected result |
|---|---|---|---|---|
| TC-REV-01 | Submit a review as an authenticated attendee eligible to review the event | Backend unit + API | Attendee is authenticated and satisfies event eligibility rules | Review is created and associated with the correct event and attendee |
| TC-REV-02 | Request review summary for an event with known reviews | Backend unit + API | Event has seeded reviews with known ratings and comments | Average rating, review count and returned review data match the seeded records |
| TC-REV-03 | Submit a review without authentication and with an unauthorized role | Backend API | Review endpoint is available; missing and Host credentials are prepared | Unauthenticated and wrong-role requests are rejected; no review is created |
| TC-REV-04 | Submit ratings outside the permitted range and invalid/empty comments | Backend unit | Review validation is available and invalid payloads are prepared | Invalid values are rejected with appropriate validation errors; no invalid review is stored |
| TC-REV-05 | Submit a duplicate or otherwise ineligible review | Backend API | Existing review or invalid eligibility state is seeded | Request is rejected with a structured error; existing review data remains unchanged |
| TC-REV-UI-01 | Open attendee event details with existing reviews | Frontend unit | Attendee event details component receives event and review data | Average rating and existing reviews render correctly |
| TC-REV-UI-02 | Submit a rating and comment as an eligible attendee | Frontend unit | Component is rendered in eligible state; submission handler/API is available | User can submit the rating/comment and the UI reflects the successful submission |
| TC-REV-UI-03 | Open event details as an attendee who is not eligible to review | Frontend unit | Component receives an ineligible attendee state | Review form is not displayed |

### 14.13 EMS-FR-13 – Logout

| TC ID | Description / procedure | Level | Entry condition | Exit condition / expected result |
|---|---|---|---|---|
| TC-LOGOUT-01 | Select Logout from an authenticated Attendee dashboard | Frontend unit | Session storage contains a valid token and user profile | Token and user profile are removed from session storage |
| TC-LOGOUT-02 | Read session through the frontend auth helpers after logout | Frontend unit | Logout action has cleared the session | `getToken` and `getUser` return null; protected content is no longer available through the cleared session |
| TC-LOGOUT-03 | Log in after a prior session has been cleared | Frontend unit | Previous session is absent and valid credentials/API response are available | New session replaces the absent/old session and contains only the newly authenticated user data |

### 14.14 EMS-FR-14 – Error messages and retry

| TC ID | Description / procedure | Level | Entry condition | Exit condition / expected result |
|---|---|---|---|---|
| TC-ERR-01 | Request an unknown API route | Backend API | Backend server is running | API returns HTTP 404 with a structured JSON message |
| TC-ERR-02 | Request a protected endpoint without a token and with an invalid token | Backend API | Protected endpoint is available | Both requests return readable JSON HTTP 401 responses |
| TC-ERR-03 | Request a Host-only endpoint using a valid Attendee token | Backend API | Valid Attendee token exists | API returns readable HTTP 403 and does not clear or invalidate the user's otherwise valid session |
| TC-ERR-04 | Render ErrorMessage with a message, retry handler and empty message | Frontend unit | ErrorMessage component is mounted with controlled props | Readable message is shown without stack trace; Retry invokes handler; no component is rendered when there is no message |
| TC-ERR-05 | Trigger server/network errors in login, signup and event forms | Frontend unit | Relevant form is mounted and API error can be controlled | Clear error feedback is displayed, entered data remains usable, and user can retry |
| TC-ERR-06 | Send malformed JSON to login and then a valid request | Backend API | Server is running and valid credentials exist | Malformed request returns HTTP 400; subsequent valid request succeeds |
| TC-ERR-07 | Request a non-existent event, then request a valid event/list | Backend API | Authenticated Host exists; event endpoint is available | First request returns 404 with a clear message; subsequent valid request succeeds |
| TC-ERR-08 | Exercise missing-token, invalid-token, wrong-role and unknown-route error paths | Backend API | Server and test credentials are available | Each condition returns its documented 401/403/404 response without leaking protected data or crashing the server |

### 14.15 EMS-NFR-01 – Performance

| TC ID | Description / procedure | Level | Entry condition | Exit condition / expected result |
|---|---|---|---|---|
| TC-PERF-01 | Measure landing-page load time over the configured number of fresh browser runs | Performance runner | Frontend server is running; browser runner is configured; warm-up/run policy is recorded | Every measured landing-page run is ≤ 5,000 ms |
| TC-PERF-02 | Measure login API response time over the configured sample | Performance runner | Backend server and test endpoint are available; sample size and warm-up policy are recorded | Measured p95 login API latency is ≤ 500 ms; report includes sample count and measurement method |
| TC-PERF-03 | Measure login operation against the explicit 2-second assertion in the login suite | Backend integration | Test server and valid test account are available; timing measurement is enabled | The tested login operation completes within 2,000 ms in the test environment; this result is not substituted for the NFR-01 p95 criterion |

### 14.16 EMS-NFR-02 – Usability

| TC ID | Description / procedure | Level | Entry condition | Exit condition / expected result |
|---|---|---|---|---|
| TC-USE-01 | Ask each first-time participant to complete signup and login without external assistance; record elapsed time for each participant | Manual usability | Application build and test environment are stable; participant has not previously used the application; test account/email is available; timing starts at the defined task start and stops when the user reaches the authenticated landing/dashboard state | Each participant completes the defined task within 120 seconds without external assistance; record all individual times, participant count, task definition, environment and any deviations. A participant exceeding 120 seconds is a failed observation. Video evidence may be cited as supplementary evidence but does not replace the recorded observations |

### 14.17 EMS-NFR-03 – Responsive layout

| TC ID | Description / procedure | Level | Entry condition | Exit condition / expected result |
|---|---|---|---|---|
| TC-RESP-01 | Inspect stylesheet rules for mobile, tablet, desktop and wide-screen breakpoints | Frontend unit | Responsive stylesheet is available to the test | Required media-query ranges/rules are present as defined by the implementation |
| TC-RESP-02 | Inspect root and major layout containers for shrink behaviour | Frontend unit | Relevant stylesheet and layout components are available | Root and major containers permit shrinking (including `min-width: 0` where required) |
| TC-RESP-03 | Open `/`, `/login` and `/signup` at viewport widths 360, 768, 1024 and 1920 px | Responsive runner | Frontend server is running; browser automation is available; each route is reachable | No horizontal overflow is detected at each specified route/width combination; result matrix is recorded |

### 14.18 EMS-NFR-04 – Reliability

| TC ID | Description / procedure | Level | Entry condition | Exit condition / expected result |
|---|---|---|---|---|
| TC-REL-01 | Cause a temporary database-unavailable condition during Host event listing | Backend API | Server is running and database availability can be controlled | API returns structured 503; server remains running and can serve a later request after restoration |
| TC-REL-02 | Cause a temporary database-unavailable condition during event details retrieval | Backend + Frontend | Event details route and UI are available; database failure/recovery can be simulated | Error is handled safely; after recovery, retry retrieves the event without restarting the application |
| TC-REL-03 | Send concurrent Host event-list requests | Backend API | Test database is seeded; authenticated Host token is available; concurrency level is specified by the test | All completed responses are consistent and server remains operational; report exact concurrency and failures |
| TC-REL-04 | Send concurrent event-creation requests | Backend API | Authenticated Host token and unique valid event payloads are available; test database is available | All expected creates are persisted without lost records or duplicate unintended IDs |
| TC-REL-05 | Send concurrent login requests and a burst of invalid login requests | Backend API | Valid account exists; test server is available; concurrency/request count is specified | Valid requests succeed and invalid requests do not crash or render the server unresponsive; record exact load used |

### 14.19 EMS-NFR-05 – Configuration

| TC ID | Description / procedure | Level | Entry condition | Exit condition / expected result |
|---|---|---|---|---|
| TC-CFG-01 | Load backend configuration with PORT, MONGODB_URI, SQLITE_PATH and JWT_SECRET supplied through environment/`.env` | Backend unit | Test environment variables are set to controlled values | Configuration exposes the supplied values and does not silently replace them with defaults |
| TC-CFG-02 | Load backend configuration with optional values absent | Backend unit | Environment values are removed/isolated for the test | Documented defaults are applied for supported optional values |
| TC-CFG-03 | Build/connect using the configured MongoDB test URI | Backend unit | Test MongoDB URI is supplied and connection helper is isolated | Connection helper uses the configured URI and expected timeout/options |
| TC-CFG-04 | Simulate an initial MongoDB connection failure and inspect retry scheduling | Backend unit | MongoDB helper is mocked; retry scheduler can be observed | First retry is scheduled after failure and retry delay is capped at 30 seconds |

### 14.20 EMS-NFR-06 – Efficiency

| TC ID | Description / procedure | Level | Entry condition | Exit condition / expected result |
|---|---|---|---|---|
| TC-EFF-01 | Request paginated Host event lists across multiple pages | Backend unit + API | Host has enough events to populate multiple pages | Pagination returns the expected page size/order and does not repeat records across pages |
| TC-EFF-02 | Request event-list data and inspect returned projection | Backend unit + API | Host has events with both required and non-required fields | List response contains only the documented list fields; detail-only/sensitive/unnecessary fields are not returned |
| TC-EFF-03 | Review database query/index and caching behaviour against the NFR-06 design requirement | Design/code inspection | Relevant database model/query and caching implementation are available | Evidence identifies required indexes and bounded/no-unbounded caching behaviour; if no executable test exists, record as inspection-only or not verified rather than pass |

### 14.21 Security – Cross-cutting requirements

| TC ID | Description / procedure | Level | Entry condition | Exit condition / expected result |
|---|---|---|---|---|
| TC-SEC-01 | Create an account and inspect the stored password and API responses | Backend API | Authentication database is available; valid signup payload is prepared | Password is stored as a salted bcrypt hash; plaintext password is not returned |
| TC-SEC-02 | Verify JWT claims, signature, expiry and rejection of invalid/expired tokens | Backend API | JWT secret is configured; valid and invalid token fixtures are available | Token conforms to the specified signing/lifetime rules; invalid and expired tokens are rejected |
| TC-SEC-03 | Attempt Host and Attendee cross-role access at protected API endpoints | Backend API + Frontend | Valid tokens for both roles exist; protected endpoints/routes are available | Backend rejects unauthorized role access; frontend route guard does not expose protected content |
| TC-SEC-04 | Inspect the deployed/test environment and network requests for the required HTTP protocol behaviour | Security / configuration inspection | A running environment and browser network inspection are available | Protocol usage is recorded against the exact SRS wording; any insecure transport or ambiguity is reported as a defect/limitation. No pass is claimed without explicit evidence |
| TC-SEC-05 | Submit malformed, missing, out-of-range and injection-style inputs to the applicable signup, login, event, review and payment interfaces | Backend API + Frontend | Relevant endpoints/forms and controlled invalid payloads are available | Inputs are rejected, safely stored or rendered as data according to the field contract; no unintended code execution or data corruption occurs |
| TC-SEC-06 | Submit five consecutive failed login attempts and attempt login during the following 15-minute interval | Backend API / Security | Account exists; lockout policy is implemented or testable; attempt counter and clock can be observed | Account is locked after the fifth failed attempt for 15 minutes and valid login is rejected during the lockout; if the feature is not implemented, record as failed/not implemented |

---

## 15. Test Metrics & Reporting

**Metrics collected:**

- Number of planned test cases and counts/percentages of Passed, Failed, Blocked and Not Run.
- Requirement coverage: requirements with direct test evidence versus partial/no evidence.
- Backend and frontend statement, branch, function and line coverage, reported separately where available.
- Performance measurements including run count, maximum page-load time, API p95 and the exact endpoint measured.
- Responsive pass/fail matrix by route and viewport width.
- Usability participant count and individual signup/login completion times.
- Defect count by severity, status and affected requirement.
- Reliability/concurrency load and observed failures for each explicitly tested scenario.

**Reports:**

1. `unit-test-report.md` – combined backend unit/API and frontend component test results.
2. `performance-report.md` – page-load and API latency results with measurement scope.
3. `branch-coverage-report.md` – branch coverage results.
4. `code-coverage-report.md` – statement/function/line coverage results.
5. `system-acceptance-report.md` – functional and responsive acceptance results.
6. `NFR-02_User_Usability_Test_Report.md` – manual first-time-user observations and completion times.
7. Requirement-specific reports, including FR-11 payment test evidence where maintained.

Temporary HTML/LCOV artefacts under `tests/reports/coverage-*-temp/` are supporting inspection outputs and are not substitutes for the canonical Markdown reports.

**Reporting rules:**
- Report results against the exact test cases executed and the build/environment used.
- Do not count skipped, blocked or unexecuted cases as passed.
- Distinguish automated results from manual observations.
- Do not infer full requirement compliance from partial coverage.
- A coverage percentage measures exercised code, not correctness or complete requirement coverage.

---

## 16. Approvals

| Role | Name | Signature/Date |
|---|---|---|
| Project Manager | Piya Banerjee | Piya / 17.11.26 |
