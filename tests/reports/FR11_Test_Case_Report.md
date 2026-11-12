# FR-11: Simulated Payment — Test Case Report

## 1. Feature Overview

**Feature ID:** EMS-FR-11\
**Feature Name:** Simulated Payment\
**Module:** Attendee Payment\
**Test Type:** Unit Testing, API Integration Testing, Manual UI Testing

The feature allows an attendee to make a simulated payment after registering for a paid event. No real money is transferred.

## 2. Test Environment

- Backend: Node.js and Express
- Database: MongoDB
- Frontend: React
- Backend testing: Jest
- API testing: Jest integration tests
- Frontend testing: Manual browser testing

## 3. Test Cases

| Test ID | Test Scenario | Expected Result |
|---|---|---|
| FR11-TC-01 | Submit payment without authentication | Request is rejected |
| FR11-TC-02 | Host attempts to make a payment | Request is rejected |
| FR11-TC-03 | Unregistered attendee attempts payment | Request is rejected |
| FR11-TC-04 | Submit payment with an invalid event ID | Event not found response |
| FR11-TC-05 | Submit payment for a nonexistent event | Event not found response |
| FR11-TC-06 | Submit an invalid payment outcome | HTTP 400 response |
| FR11-TC-07 | Simulate successful payment | Payment record is created |
| FR11-TC-08 | Simulate failed payment | Failed payment is recorded |
| FR11-TC-09 | Retry after a failed payment | Another payment attempt is permitted |
| FR11-TC-10 | Attempt duplicate successful payment | Duplicate payment is rejected |
| FR11-TC-11 | Attempt payment for a free event | Payment is rejected |
| FR11-TC-12 | Payment service unavailable | HTTP 503 response |
| FR11-TC-13 | Payment controller receives valid event and registration | Correct payment processing |
| FR11-TC-14 | Payment controller encounters a database error | HTTP 500 response |
| FR11-TC-15 | Payment controller encounters a duplicate database record | HTTP 409 response |

The API suite contains 15 tests. The controller unit suite contains 19 tests covering payment validation, event and registration lookup, database availability, payment creation, duplicate handling, and error responses.

## 4. Manual Frontend Test Scenarios

| Test ID | Test Scenario | Expected Result |
|---|---|---|
| FR11-UI-01 | Register for a paid event | Checkout section appears |
| FR11-UI-02 | Select successful payment | Transaction details are displayed |
| FR11-UI-03 | Select failed payment | Failure message is displayed |
| FR11-UI-04 | Retry a failed payment | A new payment attempt is permitted |
| FR11-UI-05 | Register for a free event | Checkout is not displayed |
| FR11-UI-06 | Submit payment while processing | Repeated submission is disabled |

## 5. Test Coverage

The payment controller unit test coverage results were:

| Metric | Coverage |
|---|---:|
| Statements | 100% |
| Branches | 95.83% |
| Functions | 100% |
| Lines | 100% |

## 6. Limitations

- Payments are simulated; no actual payment gateway is integrated.
- Payment outcomes are selected by the client for demonstration purposes.
- The implementation is not suitable for processing real financial transactions.
