# Software Test Plan (STP): Event Management System

| | |
|---|---|
| **Project** | Event Management System |
| **Version** | 1.0 |
| **Authors** | Piya, Sharanya, Ananya |
| **Date** | 28-09-2026 |
| **Status** | Sample / Draft |

---

## 1. Introduction

**Purpose:** This document defines the test plan for the Event Management System v1.0. It outlines objectives, scope, strategy, resources, schedule, and responsibilities for testing.

**Scope:** Testing covers Event Management System features such as authentication, registration, dashboards (role wise), event creation and management, event search and filtering, event browsing and recommendations, simulation of payment, ratings and review, statistics for the host, error handling and security. Actual processing of payment and integration of payment services, cloud based infrastructure and scaling are excluded.

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

- Frontend module
- Authentication module
- Event management module
- Registration module
- Review and rating module
- Simulated payment and statistics module
- Configuration module
- Database module

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
| EMS-SEC-04 | HTTPS is utilised throughout |
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

| Milestone | Date |
|-----------|------|
| Test case design | [Date] |
| Test environment setup | [Date] |
| Test execution start | [Date] |
| Functional testing completion | [Date] |
| Security and performance testing | [Date] |
| Test execution end | [Date] |
| Final test summary | [Date] |

---

## 8. Test Deliverables

The following deliverables shall be produced during the testing process:

- Software Test Plan (STP)
- Test Cases
- Test Data
- Test Execution Results
- Defect Reports
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

A Requirements Traceability Matrix (RTM) shall be maintained to ensure that the functional, non-functional, and security requirements specified in the SRS are covered by appropriate test cases.

Each test case shall contain a unique test case ID and shall reference the corresponding SRS requirement.

**Example:**

| Requirement | Test Case(s) |
|-------------|--------------|
| EMS-FR-01 (Landing page) | TC-UI-01 |
| EMS-FR-02 (User registration) | TC-AUTH-01 |
| EMS-FR-03 (Login and JWT) | TC-AUTH-02 |
| EMS-FR-09 (Event search and filtering) | TC-EVT-01 |
| EMS-FR-10 (Event registration) | TC-REG-01 |
| EMS-FR-11 (Simulated payment) | TC-PAY-01, TC-PAY-02 |
| EMS-FR-12 (Rating and review) | TC-REV-01 |
| EMS-NFR-01 (Response time) | TC-PERF-01 |
| EMS-SEC-01 (Password hashing) | TC-SEC-01 |
| EMS-SEC-02 (JWT validation and expiry) | TC-SEC-02 |
| EMS-SEC-03 (Role-based authorization) | TC-SEC-03 |

The RTM shall be updated when requirements or test cases change.

---

## 14. Test Metrics & Reporting

**Metrics collected:**

- Percentage of planned test cases executed.
- Percentage of test cases passed and failed.
- Number of defects identified.
- Number of open and closed defects.
- Defect severity distribution.
- Functional requirement coverage.
- Non-functional requirement coverage.
- Security requirement coverage.
- Requirements traceability coverage.
- Performance results for operations with specified response-time requirements.

**Reports:**

- Test execution status reports.
- Defect reports.
- Requirements Traceability Matrix.
- Final Test Summary Report.

The Final Test Summary Report shall provide an overview of the testing performed, test results, outstanding defects, requirement coverage, and overall test completion status.

---

## 15. Approvals

| Role | Name | Signature/Date |
|------|------|----------------|
| Project Manager | Piya Banerjee | Piya / 28.9.26 |