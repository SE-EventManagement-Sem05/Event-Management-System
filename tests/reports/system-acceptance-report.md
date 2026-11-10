# Combined System Acceptance Report (Backend + Frontend)

Generated: 2026-11-08T06:05:15Z

Covers functional, API, integration and responsive acceptance checks aligned with SRS/SAD/Test Plan.

## Backend Acceptance / API / Integration Tests

PASS ../tests/backend/reviews.api.test.js (219.033 s)
PASS ../tests/backend/eventManagement.test.js (64.483 s)
PASS ../tests/backend/eventDetails.test.js (34.571 s)
PASS ../tests/backend/hostEvents.test.js (19.144 s)
PASS ../tests/backend/login.test.js (12.775 s)
PASS ../tests/backend/auth.test.js
PASS ../tests/backend/hostEvents.api.test.js
PASS ../tests/backend/eventDetails.api.test.js
PASS ../tests/backend/eventManagement.api.test.js
PASS ../tests/backend/errorResponses.api.test.js
PASS ../tests/backend/reviewController.unit.test.js
PASS ../tests/backend/envConfig.test.js
PASS ../tests/backend/eventController.unit.test.js
PASS ../tests/backend/mongo.unit.test.js
PASS ../tests/backend/config.unit.test.js

Test Suites: 15 passed, 15 total
Tests:       284 passed, 284 total
Snapshots:   0 total
Time:        370.086 s
Ran all test suites.

## Frontend Acceptance / Component / Flow Tests

[33mThe CJS build of Vite's Node API is deprecated. See https://vite.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated for more details.[39m
(!) Your Vite config uses features that are unsupported by `configLoader: 'native'`, which is planned to become the default in a future major version of Vite:
  - ESM syntax in a file loaded as CommonJS (../tests/configs/vitest.config.js:1:1). Use a `.mjs` extension or set `"type": "module"` in the closest package.json
Set `VITE_CONFIG_NATIVE_IGNORE_WARNING=true` to suppress this warning.
6:11:28 AM [vite] warning: `esbuild` option was specified by "vite:react-babel" plugin. This option is deprecated, please use `oxc` instead.
6:11:28 AM [vite] warning: `optimizeDeps.esbuildOptions` option was specified by "vite:react-babel" plugin. This option is deprecated, please use `optimizeDeps.rolldownOptions` instead.
Both esbuild and oxc options were set. oxc options will be used and esbuild options will be ignored. The following esbuild options were set: `{ jsx: 'automatic', jsxImportSource: undefined }`

[1m[30m[46m RUN [49m[39m[22m [36mv4.1.12 [39m[90m/mnt/c/Users/Bhavana/Music/Event-Management-System/frontend[39m

[90mstderr[2m | ../tests/frontend/Landing.test.jsx[2m > [22m[2mEMS-FR-01 Landing page content[2m > [22m[2mthe main headline states the purpose of the platform
[22m[39m⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

 [32m✓[39m ../tests/frontend/Landing.test.jsx [2m([22m[2m13 tests[22m[2m)[22m[33m 312[2mms[22m[39m
[90mstderr[2m | ../tests/frontend/HostDashboard.test.jsx[2m > [22m[2mEMS-FR-05 Host dashboard[2m > [22m[2mwelcomes the host and requests upcoming and past events separately
[22m[39m⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

[90mstderr[2m | ../tests/frontend/Login.test.jsx[2m > [22m[2mEMS-FR-03 Login form[2m > [22m[2mhas a role selector, email, password and a submit button
[22m[39m⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

 [32m✓[39m ../tests/frontend/Signup.test.jsx [2m([22m[2m7 tests[22m[2m)[22m[33m 311[2mms[22m[39m
[90mstderr[2m | ../tests/frontend/EventForm.test.jsx[2m > [22m[2mEMS-FR-07 EventForm[2m > [22m[2mshows title, description, date/time, venue, price and capacity fields
[22m[39m⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

 [32m✓[39m ../tests/frontend/HostDashboard.test.jsx [2m([22m[2m7 tests[22m[2m)[22m[33m 410[2mms[22m[39m
 [32m✓[39m ../tests/frontend/EventForm.test.jsx [2m([22m[2m10 tests[22m[2m)[22m[33m 1412[2mms[22m[39m
 [32m✓[39m ../tests/frontend/Login.test.jsx [2m([22m[2m16 tests[22m[2m)[22m[33m 1565[2mms[22m[39m
[90mstderr[2m | ../tests/frontend/Navbar.test.jsx[2m > [22m[2mEMS-FR-01 Navigation bar[2m > [22m[2mshows the logo linking to the landing page
[22m[39m⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

 [32m✓[39m ../tests/frontend/Navbar.test.jsx [2m([22m[2m6 tests[22m[2m)[22m[32m 275[2mms[22m[39m
[90mstderr[2m | ../tests/frontend/CreateEvent.test.jsx[2m > [22m[2mEMS-FR-07 Create event page[2m > [22m[2msaving returns to the dashboard with a success notice
[22m[39m⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

 [32m✓[39m ../tests/frontend/ErrorMessage.test.jsx [2m([22m[2m3 tests[22m[2m)[22m[32m 136[2mms[22m[39m
 [32m✓[39m ../tests/frontend/CreateEvent.test.jsx [2m([22m[2m3 tests[22m[2m)[22m[33m 758[2mms[22m[39m
     [33m[2m✓[22m[39m saving returns to the dashboard with a success notice [33m 380[2mms[22m[39m
[90mstderr[2m | ../tests/frontend/loginFlow.test.jsx[2m > [22m[2mEMS-FR-03 login journey through the app[2m > [22m[2ma host who logs in reaches the guarded host dashboard
[22m[39m⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

 [32m✓[39m ../tests/frontend/loginFlow.test.jsx [2m([22m[2m3 tests[22m[2m)[22m[33m 556[2mms[22m[39m
     [33m[2m✓[22m[39m a host who logs in reaches the guarded host dashboard [33m 321[2mms[22m[39m
[90mstderr[2m | ../tests/frontend/App.test.jsx[2m > [22m[2mEMS-FR-01 Landing page in the app[2m > [22m[2mthe landing page is shown at / with the navigation bar and footer
[22m[39m⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

 [32m✓[39m ../tests/frontend/events.test.js [2m([22m[2m15 tests[22m[2m)[22m[32m 16[2mms[22m[39m
 [32m✓[39m ../tests/frontend/App.test.jsx [2m([22m[2m11 tests[22m[2m)[22m[33m 506[2mms[22m[39m
[90mstderr[2m | ../tests/frontend/AttendeeEventDetails.test.jsx[2m > [22m[2mEMS-FR-12 attendee reviews[2m > [22m[2mshows the average rating and existing reviews
[22m[39m⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

 [32m✓[39m ../tests/frontend/AttendeeEventDetails.test.jsx [2m([22m[2m3 tests[22m[2m)[22m[33m 344[2mms[22m[39m
[90mstderr[2m | ../tests/frontend/EventDetails.test.jsx[2m > [22m[2mEMS-FR-06 Event details page[2m > [22m[2mrequests the event named in the URL
[22m[39m⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

 [32m✓[39m ../tests/frontend/EventDetails.test.jsx [2m([22m[2m14 tests[22m[2m)[22m[33m 315[2mms[22m[39m
[90mstderr[2m | ../tests/frontend/EventSection.test.jsx[2m > [22m[2mEMS-FR-05 EventSection[2m > [22m[2meach title links to the details page when getDetailsPath is given (EMS-FR-06)
[22m[39m⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

 [32m✓[39m ../tests/frontend/EventSection.test.jsx [2m([22m[2m12 tests[22m[2m)[22m[33m 376[2mms[22m[39m
[90mstderr[2m | ../tests/frontend/ProtectedRoute.test.jsx[2m > [22m[2mEMS-FR-04 ProtectedRoute[2m > [22m[2mredirects to login when there is no session
[22m[39m⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

 [32m✓[39m ../tests/frontend/ProtectedRoute.test.jsx [2m([22m[2m7 tests[22m[2m)[22m[32m 146[2mms[22m[39m
[90mstderr[2m | ../tests/frontend/EditEvent.test.jsx[2m > [22m[2mEMS-FR-07 Edit event page[2m > [22m[2mloads the event and pre-fills the form
[22m[39m⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

 [32m✓[39m ../tests/frontend/EditEvent.test.jsx [2m([22m[2m6 tests[22m[2m)[22m[32m 290[2mms[22m[39m
 [32m✓[39m ../tests/frontend/eventFormat.test.js [2m([22m[2m12 tests[22m[2m)[22m[32m 15[2mms[22m[39m
Not implemented: navigation to another Document
 [32m✓[39m ../tests/frontend/AttendeeDashboard.test.jsx [2m([22m[2m3 tests[22m[2m)[22m[32m 112[2mms[22m[39m
 [32m✓[39m ../tests/frontend/eventForm.test.js [2m([22m[2m30 tests[22m[2m)[22m[32m 10[2mms[22m[39m
 [32m✓[39m ../tests/frontend/auth.test.js [2m([22m[2m8 tests[22m[2m)[22m[32m 7[2mms[22m[39m
 [32m✓[39m ../tests/frontend/responsive.test.js [2m([22m[2m5 tests[22m[2m)[22m[32m 4[2mms[22m[39m

[2m Test Files [22m [1m[32m21 passed[39m[22m[90m (21)[39m
[2m      Tests [22m [1m[32m194 passed[39m[22m[90m (194)[39m
[2m   Start at [22m 06:11:30
[2m   Duration [22m 34.16s[2m (transform 12.76s, setup 103.17s, import 42.49s, tests 7.88s, environment 293.99s)[22m


## Responsive Layout Acceptance (EMS-NFR-03)

Note: requires frontend dev server at BASE_URL (default http://localhost:5173).

PASS / at 360px (HTTP 200, document 360px)
PASS / at 768px (HTTP 200, document 768px)
PASS / at 1024px (HTTP 200, document 1024px)
PASS / at 1920px (HTTP 200, document 1920px)
PASS /login at 360px (HTTP 200, document 360px)
PASS /login at 768px (HTTP 200, document 768px)
PASS /login at 1024px (HTTP 200, document 1024px)
PASS /login at 1920px (HTTP 200, document 1920px)
PASS /signup at 360px (HTTP 200, document 360px)
PASS /signup at 768px (HTTP 200, document 768px)
PASS /signup at 1024px (HTTP 200, document 1024px)
PASS /signup at 1920px (HTTP 200, document 1920px)
Overall: PASS
Raw results: tests/reports/responsive-results.json
Report: tests/reports/responsive-report.md

## Summary
System acceptance suites completed. Review pass/fail above.
Responsive results (if run): tests/reports/responsive-report.md and responsive-results.json
