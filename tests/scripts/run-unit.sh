#!/usr/bin/env bash
# Combined unit test report for backend + frontend
# Execute from project root: ./tests/scripts/run-unit.sh
# Or from tests/: ./scripts/run-unit.sh
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
REPORTS="$ROOT/tests/reports"
mkdir -p "$REPORTS"
UNIT_LOG="$REPORTS/unit-test-report.md"

{
  echo "# Combined Unit Test Report (Backend + Frontend)"
  echo
  echo "Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo
  echo "## Backend Unit Tests"
  echo
} > "$UNIT_LOG"

cd "$ROOT/backend"
set -o pipefail
npx jest --config "$ROOT/tests/configs/jest.backend.config.cjs" --runInBand --runTestsByPath \
  "$ROOT/tests/backend/reviewController.unit.test.js" \
  "$ROOT/tests/backend/eventController.unit.test.js" \
  "$ROOT/tests/backend/config.unit.test.js" \
  "$ROOT/tests/backend/mongo.unit.test.js" 2>&1 | tee -a "$UNIT_LOG"

{
  echo
  echo "## Frontend Unit / Component Tests"
  echo
} >> "$UNIT_LOG"

cd "$ROOT/frontend"
set -o pipefail
npx vitest run --config "$ROOT/tests/configs/vitest.config.js" 2>&1 | tee -a "$UNIT_LOG"

{
  echo
  echo "## Summary"
  echo "Unit tests for backend controllers/config/mongo and all frontend component tests completed."
  echo "See log above for pass/fail details."
} >> "$UNIT_LOG"

echo
echo "Unit test report written to: tests/reports/unit-test-report.md"
