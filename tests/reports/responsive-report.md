# EMS-NFR-03 Responsive Browser Test Report

- Generated: 2026-11-08T06:12:09.373Z
- Base URL: http://localhost:5173
- Browser: Playwright Chromium (headless)
- Viewport heights: 900px
- Tested routes: /, /login, /signup
- Tested widths: 360, 768, 1024, 1920px

| Route | Width (px) | HTTP | Document width (px) | Horizontal overflow | Page errors | Result |
|---|---:|---:|---:|---|---:|---|
| / | 360 | 200 | 360 | NO | 0 | PASS |
| / | 768 | 200 | 768 | NO | 0 | PASS |
| / | 1024 | 200 | 1024 | NO | 0 | PASS |
| / | 1920 | 200 | 1920 | NO | 0 | PASS |
| /login | 360 | 200 | 360 | NO | 0 | PASS |
| /login | 768 | 200 | 768 | NO | 0 | PASS |
| /login | 1024 | 200 | 1024 | NO | 0 | PASS |
| /login | 1920 | 200 | 1920 | NO | 0 | PASS |
| /signup | 360 | 200 | 360 | NO | 0 | PASS |
| /signup | 768 | 200 | 768 | NO | 0 | PASS |
| /signup | 1024 | 200 | 1024 | NO | 0 | PASS |
| /signup | 1920 | 200 | 1920 | NO | 0 | PASS |

**Overall: PASS**

This script checks the landing, login and signup routes only. It does not prove layout correctness for authenticated dashboards or every browser engine. Those routes require authenticated test setup and separate cross-browser execution.
