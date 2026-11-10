#!/usr/bin/env bash
# Combined system acceptance report (backend + frontend functional/API tests + responsive)
# Execute from project root: ./tests/scripts/run-system-acceptance.sh
# Requires: backend and frontend servers running for responsive part if desired;
#           the jest/vitest suites are self-contained with mocks / test DB.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
REPORTS="$ROOT/tests/reports"
mkdir -p "$REPORTS"
ACCEPT_LOG="$REPORTS/system-acceptance-report.md"

{
  echo "# Combined System Acceptance Report (Backend + Frontend)"
  echo
  echo "Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo
  echo "Covers functional, API, integration and responsive acceptance checks aligned with SRS/SAD/Test Plan."
  echo
  echo "## Backend Acceptance / API / Integration Tests"
  echo
} > "$ACCEPT_LOG"

cd "$ROOT/backend"
set -o pipefail
npx jest --config "$ROOT/tests/configs/jest.backend.config.cjs" --runInBand 2>&1 | tee -a "$ACCEPT_LOG"

{
  echo
  echo "## Frontend Acceptance / Component / Flow Tests"
  echo
} >> "$ACCEPT_LOG"

cd "$ROOT/frontend"
set -o pipefail
npx vitest run --config "$ROOT/tests/configs/vitest.config.js" 2>&1 | tee -a "$ACCEPT_LOG"

{
  echo
  echo "## Responsive Layout Acceptance (EMS-NFR-03)"
  echo
  echo "Note: requires frontend dev server at BASE_URL (default http://localhost:5173)."
  echo
} >> "$ACCEPT_LOG"

cd "$ROOT/tests/responsive"
# Use playwright from frontend or performance; prefer frontend node_modules if present
export NODE_PATH="$ROOT/frontend/node_modules:${NODE_PATH:-}"
if node -e "import('playwright')" 2>/dev/null || [ -d "$ROOT/frontend/node_modules/playwright" ]; then
  node verify-responsive.mjs 2>&1 | tee -a "$ACCEPT_LOG" || true
else
  echo "Playwright not available; skipping live responsive browser checks. Install playwright in frontend or performance." | tee -a "$ACCEPT_LOG"
fi

{
  echo
  echo "## Summary"
  echo "System acceptance suites completed. Review pass/fail above."
  echo "Responsive results (if run): tests/reports/responsive-report.md and responsive-results.json"
} >> "$ACCEPT_LOG"

echo
echo "System acceptance report: tests/reports/system-acceptance-report.md"
