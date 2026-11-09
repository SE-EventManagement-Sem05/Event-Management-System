# Combined Branch Coverage Report (Backend + Frontend)

Generated: 2026-11-08T05:58:26Z

Threshold: branches >= 80%

## Backend Branch Coverage

PASS ../tests/backend/reviews.api.test.js (202.897 s)
PASS ../tests/backend/eventManagement.test.js (68.623 s)
PASS ../tests/backend/eventDetails.test.js (38.117 s)
PASS ../tests/backend/hostEvents.test.js (19.938 s)
PASS ../tests/backend/login.test.js (13.263 s)
PASS ../tests/backend/reviewController.unit.test.js
PASS ../tests/backend/auth.test.js
PASS ../tests/backend/hostEvents.api.test.js
PASS ../tests/backend/eventManagement.api.test.js
PASS ../tests/backend/eventDetails.api.test.js
PASS ../tests/backend/errorResponses.api.test.js
PASS ../tests/backend/eventController.unit.test.js
PASS ../tests/backend/envConfig.test.js
PASS ../tests/backend/config.unit.test.js
PASS ../tests/backend/mongo.unit.test.js
----------------------|---------|----------|---------|---------|-----------------------------------
File                  | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s                 
----------------------|---------|----------|---------|---------|-----------------------------------
All files             |   96.67 |    97.71 |   94.11 |   96.93 |                                   
 backend              |   90.17 |    92.18 |   83.33 |   90.99 |                                   
  config.js           |     100 |      100 |     100 |     100 |                                   
  db.js               |     100 |      100 |     100 |     100 |                                   
  mongo.js            |   93.33 |      100 |      50 |     100 |                                   
  server.js           |    88.5 |     90.9 |      90 |    88.5 | 77-78,146-147,273,294-296,306-309 
 backend/controllers  |     100 |      100 |     100 |     100 |                                   
  eventController.js  |     100 |      100 |     100 |     100 |                                   
  reviewController.js |     100 |      100 |     100 |     100 |                                   
 backend/models       |     100 |      100 |     100 |     100 |                                   
  Event.js            |     100 |      100 |     100 |     100 |                                   
  Registration.js     |     100 |      100 |     100 |     100 |                                   
  Review.js           |     100 |      100 |     100 |     100 |                                   
 backend/validators   |     100 |      100 |     100 |     100 |                                   
  eventValidator.js   |     100 |      100 |     100 |     100 |                                   
----------------------|---------|----------|---------|---------|-----------------------------------

=============================== Coverage summary ===============================
Statements   : 96.67% ( 320/331 )
Branches     : 97.71% ( 214/219 )
Functions    : 94.11% ( 32/34 )
Lines        : 96.93% ( 316/326 )
================================================================================

Test Suites: 15 passed, 15 total
Tests:       284 passed, 284 total
Snapshots:   0 total
Time:        362.844 s
Ran all test suites.

## Frontend Branch Coverage

[33mThe CJS build of Vite's Node API is deprecated. See https://vite.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated for more details.[39m
(!) Your Vite config uses features that are unsupported by `configLoader: 'native'`, which is planned to become the default in a future major version of Vite:
  - ESM syntax in a file loaded as CommonJS (../tests/configs/vitest.config.js:1:1). Use a `.mjs` extension or set `"type": "module"` in the closest package.json
Set `VITE_CONFIG_NATIVE_IGNORE_WARNING=true` to suppress this warning.
6:04:32 AM [vite] warning: `esbuild` option was specified by "vite:react-babel" plugin. This option is deprecated, please use `oxc` instead.
6:04:32 AM [vite] warning: `optimizeDeps.esbuildOptions` option was specified by "vite:react-babel" plugin. This option is deprecated, please use `optimizeDeps.rolldownOptions` instead.
Both esbuild and oxc options were set. oxc options will be used and esbuild options will be ignored. The following esbuild options were set: `{ jsx: 'automatic', jsxImportSource: undefined }`

[1m[30m[46m RUN [49m[39m[22m [36mv4.1.12 [39m[90m/mnt/c/Users/Bhavana/Music/Event-Management-System/frontend[39m
      [2mCoverage enabled with [22m[33mv8[39m

[90mstderr[2m | ../tests/frontend/ProtectedRoute.test.jsx[2m > [22m[2mEMS-FR-04 ProtectedRoute[2m > [22m[2mredirects to login when there is no session
[22m[39m⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

 [32m✓[39m ../tests/frontend/ProtectedRoute.test.jsx [2m([22m[2m7 tests[22m[2m)[22m[32m 172[2mms[22m[39m
[90mstderr[2m | ../tests/frontend/EditEvent.test.jsx[2m > [22m[2mEMS-FR-07 Edit event page[2m > [22m[2mloads the event and pre-fills the form
[22m[39m⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

[90mstderr[2m | ../tests/frontend/EventForm.test.jsx[2m > [22m[2mEMS-FR-07 EventForm[2m > [22m[2mshows title, description, date/time, venue, price and capacity fields
[22m[39m⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

 [32m✓[39m ../tests/frontend/Signup.test.jsx [2m([22m[2m7 tests[22m[2m)[22m[33m 370[2mms[22m[39m
 [32m✓[39m ../tests/frontend/EditEvent.test.jsx [2m([22m[2m6 tests[22m[2m)[22m[33m 420[2mms[22m[39m
[90mstderr[2m | ../tests/frontend/Landing.test.jsx[2m > [22m[2mEMS-FR-01 Landing page content[2m > [22m[2mthe main headline states the purpose of the platform
[22m[39m⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

[90mstderr[2m | ../tests/frontend/Login.test.jsx[2m > [22m[2mEMS-FR-03 Login form[2m > [22m[2mhas a role selector, email, password and a submit button
[22m[39m⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

[90mstderr[2m | ../tests/frontend/AttendeeEventDetails.test.jsx[2m > [22m[2mEMS-FR-12 attendee reviews[2m > [22m[2mshows the average rating and existing reviews
[22m[39m⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

[90mstderr[2m | ../tests/frontend/EventDetails.test.jsx[2m > [22m[2mEMS-FR-06 Event details page[2m > [22m[2mrequests the event named in the URL
[22m[39m⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

[90mstderr[2m | ../tests/frontend/CreateEvent.test.jsx[2m > [22m[2mEMS-FR-07 Create event page[2m > [22m[2msaving returns to the dashboard with a success notice
[22m[39m⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

 [32m✓[39m ../tests/frontend/Landing.test.jsx [2m([22m[2m13 tests[22m[2m)[22m[33m 545[2mms[22m[39m
[90mstderr[2m | ../tests/frontend/loginFlow.test.jsx[2m > [22m[2mEMS-FR-03 login journey through the app[2m > [22m[2ma host who logs in reaches the guarded host dashboard
[22m[39m⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

[90mstderr[2m | ../tests/frontend/App.test.jsx[2m > [22m[2mEMS-FR-01 Landing page in the app[2m > [22m[2mthe landing page is shown at / with the navigation bar and footer
[22m[39m⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

[90mstderr[2m | ../tests/frontend/EventSection.test.jsx[2m > [22m[2mEMS-FR-05 EventSection[2m > [22m[2meach title links to the details page when getDetailsPath is given (EMS-FR-06)
[22m[39m⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

 [32m✓[39m ../tests/frontend/EventDetails.test.jsx [2m([22m[2m14 tests[22m[2m)[22m[33m 648[2mms[22m[39m
 [32m✓[39m ../tests/frontend/AttendeeEventDetails.test.jsx [2m([22m[2m3 tests[22m[2m)[22m[33m 662[2mms[22m[39m
     [33m[2m✓[22m[39m shows the average rating and existing reviews [33m 320[2mms[22m[39m
     [33m[2m✓[22m[39m a review-eligible attendee can submit a rating and comment [33m 313[2mms[22m[39m
 [32m✓[39m ../tests/frontend/EventSection.test.jsx [2m([22m[2m12 tests[22m[2m)[22m[33m 676[2mms[22m[39m
     [33m[2m✓[22m[39m Next and Previous move between pages and respect the boundaries [33m 305[2mms[22m[39m
 [32m✓[39m ../tests/frontend/EventForm.test.jsx [2m([22m[2m10 tests[22m[2m)[22m[33m 1862[2mms[22m[39m
 [32m✓[39m ../tests/frontend/App.test.jsx [2m([22m[2m11 tests[22m[2m)[22m[33m 963[2mms[22m[39m
     [33m[2m✓[22m[39m the landing page is shown at / with the navigation bar and footer [33m 313[2mms[22m[39m
 [32m✓[39m ../tests/frontend/loginFlow.test.jsx [2m([22m[2m3 tests[22m[2m)[22m[33m 1025[2mms[22m[39m
     [33m[2m✓[22m[39m a host who logs in reaches the guarded host dashboard [33m 647[2mms[22m[39m
 [32m✓[39m ../tests/frontend/CreateEvent.test.jsx [2m([22m[2m3 tests[22m[2m)[22m[33m 1263[2mms[22m[39m
     [33m[2m✓[22m[39m saving returns to the dashboard with a success notice [33m 716[2mms[22m[39m
     [33m[2m✓[22m[39m a server error keeps the user on the form [33m 320[2mms[22m[39m
 [32m✓[39m ../tests/frontend/Login.test.jsx [2m([22m[2m16 tests[22m[2m)[22m[33m 1980[2mms[22m[39m
 [32m✓[39m ../tests/frontend/events.test.js [2m([22m[2m15 tests[22m[2m)[22m[32m 15[2mms[22m[39m
 [32m✓[39m ../tests/frontend/eventFormat.test.js [2m([22m[2m12 tests[22m[2m)[22m[32m 15[2mms[22m[39m
[90mstderr[2m | ../tests/frontend/HostDashboard.test.jsx[2m > [22m[2mEMS-FR-05 Host dashboard[2m > [22m[2mwelcomes the host and requests upcoming and past events separately
[22m[39m⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

 [32m✓[39m ../tests/frontend/HostDashboard.test.jsx [2m([22m[2m7 tests[22m[2m)[22m[33m 336[2mms[22m[39m
[90mstderr[2m | ../tests/frontend/Navbar.test.jsx[2m > [22m[2mEMS-FR-01 Navigation bar[2m > [22m[2mshows the logo linking to the landing page
[22m[39m⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

 [32m✓[39m ../tests/frontend/Navbar.test.jsx [2m([22m[2m6 tests[22m[2m)[22m[32m 244[2mms[22m[39m
Not implemented: navigation to another Document
 [32m✓[39m ../tests/frontend/AttendeeDashboard.test.jsx [2m([22m[2m3 tests[22m[2m)[22m[32m 122[2mms[22m[39m
 [32m✓[39m ../tests/frontend/ErrorMessage.test.jsx [2m([22m[2m3 tests[22m[2m)[22m[32m 135[2mms[22m[39m
 [32m✓[39m ../tests/frontend/eventForm.test.js [2m([22m[2m30 tests[22m[2m)[22m[32m 10[2mms[22m[39m
 [32m✓[39m ../tests/frontend/auth.test.js [2m([22m[2m8 tests[22m[2m)[22m[32m 6[2mms[22m[39m
 [32m✓[39m ../tests/frontend/responsive.test.js [2m([22m[2m5 tests[22m[2m)[22m[32m 6[2mms[22m[39m

[2m Test Files [22m [1m[32m21 passed[39m[22m[90m (21)[39m
[2m      Tests [22m [1m[32m194 passed[39m[22m[90m (194)[39m
[2m   Start at [22m 06:04:36
[2m   Duration [22m 37.61s[2m (transform 17.66s, setup 84.43s, import 47.65s, tests 11.47s, environment 323.46s)[22m

[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   92.24 |    86.31 |   93.07 |   93.85 |                   
 src               |      50 |      100 |     100 |      50 |                   
  App.jsx          |     100 |      100 |     100 |     100 |                   
  main.jsx         |       0 |      100 |     100 |       0 | 9                 
 src/components    |   91.27 |    85.92 |   97.77 |    94.7 |                   
  ErrorMessage.jsx |     100 |       80 |     100 |     100 | 13-14             
  EventForm.jsx    |   97.36 |    86.36 |     100 |     100 | 53,71,79          
  EventSection.jsx |   92.85 |    88.88 |     100 |     100 | 10,42,54,57-61    
  Footer.jsx       |     100 |      100 |     100 |     100 |                   
  Layout.jsx       |     100 |      100 |     100 |     100 |                   
  Logo.jsx         |     100 |      100 |     100 |     100 |                   
  Navbar.jsx       |     100 |      100 |     100 |     100 |                   
  Orbs.jsx         |   93.33 |       50 |     100 |     100 | 7                 
  ...ctedRoute.jsx |      90 |    89.65 |     100 |    92.3 | 16,53-54          
  Reveal.jsx       |    62.5 |    55.55 |      75 |   64.28 | 10-11,15-17       
  ...ewSection.jsx |     100 |    92.85 |     100 |     100 | 32                
 src/pages         |   91.28 |    81.25 |   89.83 |   92.47 |                   
  ...Dashboard.jsx |     100 |       75 |     100 |     100 | 3                 
  ...ntDetails.jsx |      74 |       50 |   72.72 |   76.08 | ...0,75-80,91-102 
  CreateEvent.jsx  |     100 |      100 |     100 |     100 |                   
  EditEvent.jsx    |   92.85 |       75 |   85.71 |   96.15 | 77                
  EventDetails.jsx |   97.05 |    85.18 |     100 |     100 | 35-38,63,114      
  ...Dashboard.jsx |   78.94 |    83.33 |   77.77 |   78.94 | 38-44             
  Landing.jsx      |     100 |      100 |     100 |     100 |                   
  Login.jsx        |    97.5 |     90.9 |     100 |   97.29 | 29                
  Signup.jsx       |     100 |      100 |     100 |     100 |                   
 src/utils         |   97.02 |    96.47 |      92 |   96.77 |                   
  auth.js          |     100 |      100 |     100 |     100 |                   
  eventForm.js     |     100 |      100 |     100 |     100 |                   
  eventFormat.js   |     100 |      100 |     100 |     100 |                   
  events.js        |   89.65 |    88.88 |      80 |   89.28 | 99-107            
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 92.24% ( 476/516 )
Branches     : 86.31% ( 328/380 )
Functions    : 93.07% ( 121/130 )
Lines        : 93.85% ( 443/472 )
================================================================================

## Detailed HTML / LCOV
- Backend temp HTML: tests/reports/coverage-backend-temp/
- Frontend temp HTML: tests/reports/coverage-frontend-temp/

Branch coverage threshold (>= 80%) is enforced by the runners.
