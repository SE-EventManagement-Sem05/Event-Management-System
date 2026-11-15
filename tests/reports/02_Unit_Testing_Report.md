# Eventide EMS — Unit Testing Report
**Execution date:** 12 November 2026

## Results
| Layer | Suites/files | Tests | Passed | Failed |
|---|---:|---:|---:|---:|
| Frontend Vitest | 21 | 194 | 194 | 0 |
| Targeted backend Jest | 6 | 86 | 86 | 0 |
| **Total targeted tests** | **27** | **280** | **280** | **0** |

## Frontend coverage areas evidenced by the executed suites
- Login, signup, and login journeys
- Protected routes and role-specific dashboards
- Attendee dashboard and logout storage clearing
- Event listing, event details, search/filter utilities, and event formatting
- Event creation/editing form validation and submission
- Payment-related frontend coverage where present in the suite
- Responsive utility checks and shared UI components

## Backend coverage areas in the targeted run
- Authentication
- Attendee event listing
- Attendee event search and filtering
- Attendee registration
- Payment API and payment controller unit behavior

## Scope limitation
This report records executed test counts and suite outcomes. It does not claim that the 280 tests represent every test in the repository or that all functionality has been manually accepted in a live deployment.
