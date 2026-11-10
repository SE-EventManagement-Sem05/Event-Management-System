#!/usr/bin/env bash
# Combined performance report (page load + API latency) — covers backend API and frontend page
# Execute from project root: ./tests/scripts/run-performance.sh
# Requires: frontend running at BASE_URL and backend at API_URL (defaults localhost)
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
REPORTS="$ROOT/tests/reports"
mkdir -p "$REPORTS"

cd "$ROOT/tests/performance"
# Prefer playwright from frontend (already a dep) or local
export NODE_PATH="$ROOT/frontend/node_modules:${NODE_PATH:-}"
if [ -f package.json ] && [ ! -d node_modules ]; then
  echo "Installing performance deps (playwright) if needed..."
  npm install --no-audit --no-fund 2>/dev/null || true
fi

node run-performance.mjs 2>&1 | tee "$REPORTS/performance-run.log"

# The runner already writes performance-report.md and performance-results.json into reports/
# Ensure the canonical name is present
if [ -f "$REPORTS/performance-report.md" ]; then
  echo "Performance report: tests/reports/performance-report.md"
else
  echo "Performance runner did not produce report; check log." >&2
  exit 1
fi
