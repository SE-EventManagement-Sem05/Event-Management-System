#!/usr/bin/env bash
# Run all test categories and produce the five required reports under tests/reports/
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "=== 1/4 Unit tests ==="
"$SCRIPT_DIR/run-unit.sh"

echo
echo "=== 2/4 Coverage (code + branch) ==="
"$SCRIPT_DIR/run-coverage.sh"

echo
echo "=== 3/4 System acceptance ==="
"$SCRIPT_DIR/run-system-acceptance.sh"

echo
echo "=== 4/4 Performance ==="
"$SCRIPT_DIR/run-performance.sh" || true

echo
echo "All report generation finished. Reports in tests/reports/:"
ls -la "$ROOT/tests/reports/" | grep -E 'unit-test|code-coverage|branch-coverage|system-acceptance|performance-report' || true
