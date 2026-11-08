#!/usr/bin/env bash
# Combined code coverage + branch coverage reports (backend + frontend)
# Execute from project root: ./tests/scripts/run-coverage.sh
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
REPORTS="$ROOT/tests/reports"
mkdir -p "$REPORTS"
CODE_LOG="$REPORTS/code-coverage-report.md"
BRANCH_LOG="$REPORTS/branch-coverage-report.md"

{
  echo "# Combined Code Coverage Report (Backend + Frontend)"
  echo
  echo "Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo
  echo "Thresholds: statements/functions/lines >= 80%"
  echo
  echo "## Backend Code Coverage"
  echo
} > "$CODE_LOG"

{
  echo "# Combined Branch Coverage Report (Backend + Frontend)"
  echo
  echo "Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo
  echo "Threshold: branches >= 80%"
  echo
  echo "## Backend Branch Coverage"
  echo
} > "$BRANCH_LOG"

cd "$ROOT/backend"
set -o pipefail
npx jest --config "$ROOT/tests/configs/jest.backend.config.cjs" --runInBand --coverage 2>&1 | tee -a "$CODE_LOG" | tee -a "$BRANCH_LOG"

{
  echo
  echo "## Frontend Code Coverage"
  echo
} >> "$CODE_LOG"
{
  echo
  echo "## Frontend Branch Coverage"
  echo
} >> "$BRANCH_LOG"

cd "$ROOT/frontend"
set -o pipefail
npx vitest run --config "$ROOT/tests/configs/vitest.config.js" --coverage 2>&1 | tee -a "$CODE_LOG" | tee -a "$BRANCH_LOG"

# Append summary pointers
{
  echo
  echo "## Detailed HTML / LCOV"
  echo "- Backend temp HTML: tests/reports/coverage-backend-temp/"
  echo "- Frontend temp HTML: tests/reports/coverage-frontend-temp/"
  echo
  echo "Coverage thresholds (80% statements, branches, functions, lines) are enforced by the runners."
} >> "$CODE_LOG"

{
  echo
  echo "## Detailed HTML / LCOV"
  echo "- Backend temp HTML: tests/reports/coverage-backend-temp/"
  echo "- Frontend temp HTML: tests/reports/coverage-frontend-temp/"
  echo
  echo "Branch coverage threshold (>= 80%) is enforced by the runners."
} >> "$BRANCH_LOG"

echo
echo "Code coverage report: tests/reports/code-coverage-report.md"
echo "Branch coverage report: tests/reports/branch-coverage-report.md"
