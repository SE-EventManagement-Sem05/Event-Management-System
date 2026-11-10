# Combined Unit Test Report (Backend + Frontend)

Generated: 2026-11-08T05:57:39Z

## Backend Unit Tests

PASS ../tests/backend/reviewController.unit.test.js
PASS ../tests/backend/eventController.unit.test.js
PASS ../tests/backend/mongo.unit.test.js
PASS ../tests/backend/config.unit.test.js

Test Suites: 4 passed, 4 total
Tests:       68 passed, 68 total
Snapshots:   0 total
Time:        6.946 s
Ran all test suites within paths "/mnt/c/Users/Bhavana/Music/Event-Management-System/tests/backend/reviewController.unit.test.js", "/mnt/c/Users/Bhavana/Music/Event-Management-System/tests/backend/eventController.unit.test.js", "/mnt/c/Users/Bhavana/Music/Event-Management-System/tests/backend/config.unit.test.js", "/mnt/c/Users/Bhavana/Music/Event-Management-System/tests/backend/mongo.unit.test.js".

## Frontend Unit / Component Tests

[33mThe CJS build of Vite's Node API is deprecated. See https://vite.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated for more details.[39m
(!) Your Vite config uses features that are unsupported by `configLoader: 'native'`, which is planned to become the default in a future major version of Vite:
  - ESM syntax in a file loaded as CommonJS (../tests/configs/vitest.config.js:1:1). Use a `.mjs` extension or set `"type": "module"` in the closest package.json
Set `VITE_CONFIG_NATIVE_IGNORE_WARNING=true` to suppress this warning.
5:57:50 AM [vite] warning: `esbuild` option was specified by "vite:react-babel" plugin. This option is deprecated, please use `oxc` instead.
5:57:50 AM [vite] warning: `optimizeDeps.esbuildOptions` option was specified by "vite:react-babel" plugin. This option is deprecated, please use `optimizeDeps.rolldownOptions` instead.
Both esbuild and oxc options were set. oxc options will be used and esbuild options will be ignored. The following esbuild options were set: `{ jsx: 'automatic', jsxImportSource: undefined }`

[1m[30m[46m RUN [49m[39m[22m [36mv4.1.12 [39m[90m/mnt/c/Users/Bhavana/Music/Event-Management-System/frontend[39m

[90mstderr[2m | ../tests/frontend/EventDetails.test.jsx[2m > [22m[2mEMS-FR-06 Event details page[2m > [22m[2mrequests the event named in the URL
[22m[39m⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

[90mstderr[2m | ../tests/frontend/EventSection.test.jsx[2m > [22m[2mEMS-FR-05 EventSection[2m > [22m[2meach title links to the details page when getDetailsPath is given (EMS-FR-06)
[22m[39m⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

 [32m✓[39m ../tests/frontend/EventSection.test.jsx [2m([22m[2m12 tests[22m[2m)[22m[33m 419[2mms[22m[39m
 [32m✓[39m ../tests/frontend/Signup.test.jsx [2m([22m[2m7 tests[22m[2m)[22m[33m 325[2mms[22m[39m
 [32m✓[39m ../tests/frontend/EventDetails.test.jsx [2m([22m[2m14 tests[22m[2m)[22m[33m 354[2mms[22m[39m
[90mstderr[2m | ../tests/frontend/Navbar.test.jsx[2m > [22m[2mEMS-FR-01 Navigation bar[2m > [22m[2mshows the logo linking to the landing page
[22m[39m⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

 [32m✓[39m ../tests/frontend/Navbar.test.jsx [2m([22m[2m6 tests[22m[2m)[22m[32m 242[2mms[22m[39m
[90mstderr[2m | ../tests/frontend/AttendeeEventDetails.test.jsx[2m > [22m[2mEMS-FR-12 attendee reviews[2m > [22m[2mshows the average rating and existing reviews
[22m[39m⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

[90mstderr[2m | ../tests/frontend/EditEvent.test.jsx[2m > [22m[2mEMS-FR-07 Edit event page[2m > [22m[2mloads the event and pre-fills the form
[22m[39m⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

[90mstderr[2m | ../tests/frontend/HostDashboard.test.jsx[2m > [22m[2mEMS-FR-05 Host dashboard[2m > [22m[2mwelcomes the host and requests upcoming and past events separately
[22m[39m⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

 [32m✓[39m ../tests/frontend/AttendeeEventDetails.test.jsx [2m([22m[2m3 tests[22m[2m)[22m[33m 361[2mms[22m[39m
 [32m✓[39m ../tests/frontend/EditEvent.test.jsx [2m([22m[2m6 tests[22m[2m)[22m[33m 326[2mms[22m[39m
 [32m✓[39m ../tests/frontend/HostDashboard.test.jsx [2m([22m[2m7 tests[22m[2m)[22m[33m 362[2mms[22m[39m
[90mstderr[2m | ../tests/frontend/App.test.jsx[2m > [22m[2mEMS-FR-01 Landing page in the app[2m > [22m[2mthe landing page is shown at / with the navigation bar and footer
[22m[39m⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

 [32m✓[39m ../tests/frontend/App.test.jsx [2m([22m[2m11 tests[22m[2m)[22m[33m 474[2mms[22m[39m
[90mstderr[2m | ../tests/frontend/ProtectedRoute.test.jsx[2m > [22m[2mEMS-FR-04 ProtectedRoute[2m > [22m[2mredirects to login when there is no session
[22m[39m⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

 [32m✓[39m ../tests/frontend/ProtectedRoute.test.jsx [2m([22m[2m7 tests[22m[2m)[22m[32m 143[2mms[22m[39m
[90mstderr[2m | ../tests/frontend/Login.test.jsx[2m > [22m[2mEMS-FR-03 Login form[2m > [22m[2mhas a role selector, email, password and a submit button
[22m[39m⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

[90mstderr[2m | ../tests/frontend/CreateEvent.test.jsx[2m > [22m[2mEMS-FR-07 Create event page[2m > [22m[2msaving returns to the dashboard with a success notice
[22m[39m⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

 [32m✓[39m ../tests/frontend/ErrorMessage.test.jsx [2m([22m[2m3 tests[22m[2m)[22m[32m 147[2mms[22m[39m
[90mstderr[2m | ../tests/frontend/Landing.test.jsx[2m > [22m[2mEMS-FR-01 Landing page content[2m > [22m[2mthe main headline states the purpose of the platform
[22m[39m⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

 [32m✓[39m ../tests/frontend/Landing.test.jsx [2m([22m[2m13 tests[22m[2m)[22m[33m 350[2mms[22m[39m
Not implemented: navigation to another Document
 [32m✓[39m ../tests/frontend/AttendeeDashboard.test.jsx [2m([22m[2m3 tests[22m[2m)[22m[32m 136[2mms[22m[39m
 [32m✓[39m ../tests/frontend/Login.test.jsx [2m([22m[2m16 tests[22m[2m)[22m[33m 1442[2mms[22m[39m
 [32m✓[39m ../tests/frontend/CreateEvent.test.jsx [2m([22m[2m3 tests[22m[2m)[22m[33m 823[2mms[22m[39m
     [33m[2m✓[22m[39m saving returns to the dashboard with a success notice [33m 410[2mms[22m[39m
[90mstderr[2m | ../tests/frontend/EventForm.test.jsx[2m > [22m[2mEMS-FR-07 EventForm[2m > [22m[2mshows title, description, date/time, venue, price and capacity fields
[22m[39m⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

 [32m✓[39m ../tests/frontend/EventForm.test.jsx [2m([22m[2m10 tests[22m[2m)[22m[33m 1184[2mms[22m[39m
[90mstderr[2m | ../tests/frontend/loginFlow.test.jsx[2m > [22m[2mEMS-FR-03 login journey through the app[2m > [22m[2ma host who logs in reaches the guarded host dashboard
[22m[39m⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

 [32m✓[39m ../tests/frontend/eventFormat.test.js [2m([22m[2m12 tests[22m[2m)[22m[32m 16[2mms[22m[39m
 [32m✓[39m ../tests/frontend/loginFlow.test.jsx [2m([22m[2m3 tests[22m[2m)[22m[33m 515[2mms[22m[39m
     [33m[2m✓[22m[39m a host who logs in reaches the guarded host dashboard [33m 303[2mms[22m[39m
 [32m✓[39m ../tests/frontend/events.test.js [2m([22m[2m15 tests[22m[2m)[22m[32m 13[2mms[22m[39m
 [32m✓[39m ../tests/frontend/eventForm.test.js [2m([22m[2m30 tests[22m[2m)[22m[32m 9[2mms[22m[39m
 [32m✓[39m ../tests/frontend/auth.test.js [2m([22m[2m8 tests[22m[2m)[22m[32m 6[2mms[22m[39m
 [32m✓[39m ../tests/frontend/responsive.test.js [2m([22m[2m5 tests[22m[2m)[22m[32m 4[2mms[22m[39m

[2m Test Files [22m [1m[32m21 passed[39m[22m[90m (21)[39m
[2m      Tests [22m [1m[32m194 passed[39m[22m[90m (194)[39m
[2m   Start at [22m 05:57:52
[2m   Duration [22m 34.05s[2m (transform 10.38s, setup 113.84s, import 45.23s, tests 7.65s, environment 327.36s)[22m


## Summary
Unit tests for backend controllers/config/mongo and all frontend component tests completed.
See log above for pass/fail details.
