#!/usr/bin/env bash
# scripts/preflight.sh — release pre-flight checks for taproot
#
# Usage:
#   npm run preflight              # run all checks, no version computation
#   npm run preflight -- patch     # also compute and validate next version
#   npm run preflight -- minor
#   npm run preflight -- major

set -euo pipefail

BUMP="${1:-}"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
RESET='\033[0m'

pass() { echo -e "${GREEN}✓${RESET} $1"; }
fail() { echo -e "${RED}✗${RESET} $1"; exit 1; }
section() { echo -e "\n${BOLD}$1${RESET}"; }

# ─── a. Branch status ─────────────────────────────────────────────────────────
section "Checking branch status..."
git fetch origin --quiet
STATUS=$(git status -sb)
if echo "$STATUS" | grep -q "behind"; then
  fail "Local branch is behind origin/main. Run 'git pull' before releasing."
fi
pass "Branch is up to date"

# ─── b. Tests ─────────────────────────────────────────────────────────────────
section "Running tests..."
if ! npm test --silent 2>&1; then
  fail "Tests failed — fix before releasing."
fi
pass "Tests passed"

# ─── c. Audit ─────────────────────────────────────────────────────────────────
section "Running npm audit..."
if ! npm audit --audit-level=high 2>&1; then
  fail "High-severity vulnerabilities found — run 'npm audit' for details."
fi
pass "No high-severity vulnerabilities"

# ─── d. Build ─────────────────────────────────────────────────────────────────
section "Building..."
if ! npm run build --silent 2>&1; then
  fail "Build failed — fix TypeScript errors before releasing."
fi
pass "Build succeeded"

# ─── e. Structure validation ──────────────────────────────────────────────────
section "Validating taproot structure..."
if ! node dist/cli.js validate-structure --path taproot/ 2>&1; then
  fail "Structure violations found — run 'taproot validate-structure' for details."
fi
pass "Structure valid"

# ─── f. Sync check ────────────────────────────────────────────────────────────
section "Running sync-check..."
SYNC_OUTPUT=$(node dist/cli.js sync-check --path taproot/ 2>&1)
SYNC_EXIT=$?
# sync-check exits non-zero only on errors (not warnings alone)
if [ $SYNC_EXIT -ne 0 ]; then
  echo "$SYNC_OUTPUT"
  fail "Sync-check errors found."
fi
pass "Sync-check clean (warnings are acceptable)"

# ─── g. Coverage completeness ─────────────────────────────────────────────────
section "Checking implementation coverage..."
COVERAGE_JSON=$(node dist/cli.js coverage --path taproot/ --format json 2>&1)
TOTAL=$(echo "$COVERAGE_JSON" | node -e "
const chunks = [];
process.stdin.on('data', c => chunks.push(c));
process.stdin.on('end', () => {
  const data = JSON.parse(chunks.join(''));
  process.stdout.write(String(data.totals.implementations));
});
")
COMPLETE=$(echo "$COVERAGE_JSON" | node -e "
const chunks = [];
process.stdin.on('data', c => chunks.push(c));
process.stdin.on('end', () => {
  const data = JSON.parse(chunks.join(''));
  process.stdout.write(String(data.totals.completeImpls));
});
")

if [ "$COMPLETE" -lt "$TOTAL" ]; then
  echo -e "${YELLOW}Incomplete implementations:${RESET}"
  echo "$COVERAGE_JSON" | node -e "
const chunks = [];
process.stdin.on('data', c => chunks.push(c));
process.stdin.on('end', () => {
  const data = JSON.parse(chunks.join(''));
  for (const intent of data.intents || []) {
    for (const beh of intent.behaviours || []) {
      for (const impl of beh.implementations || []) {
        if (impl.state !== 'complete' && impl.state !== 'deferred') {
          console.log('  ' + impl.path + '  (' + impl.state + ')');
        }
      }
    }
  }
});
"
  fail "${COMPLETE}/${TOTAL} implementations complete — resolve or defer before releasing."
fi
pass "${COMPLETE}/${TOTAL} implementations complete"

# ─── h. Working tree ──────────────────────────────────────────────────────────
section "Checking working tree..."
DIRTY=$(git status --porcelain)
if [ -n "$DIRTY" ]; then
  echo "$DIRTY"
  fail "Working tree is dirty — commit or stash before releasing."
fi
pass "Working tree clean"

# ─── i. Version computation (only if bump provided) ───────────────────────────
if [ -n "$BUMP" ]; then
  section "Computing next version..."

  case "$BUMP" in
    patch|minor|major) ;;
    *) fail "Invalid bump type '$BUMP'. Use: patch, minor, or major." ;;
  esac

  CURRENT=$(node -e "process.stdout.write(require('./package.json').version)")
  IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"

  case "$BUMP" in
    patch) NEXT="${MAJOR}.${MINOR}.$((PATCH + 1))" ;;
    minor) NEXT="${MAJOR}.$((MINOR + 1)).0" ;;
    major) NEXT="$((MAJOR + 1)).0.0" ;;
  esac

  if git tag -l "v${NEXT}" | grep -q .; then
    fail "Tag v${NEXT} already exists. Choose a different bump type or delete the tag first."
  fi

  pass "v${CURRENT} → v${NEXT} (tag v${NEXT} is available)"
  echo ""
  echo -e "${GREEN}${BOLD}✓ All pre-flight checks passed. Ready to release v${NEXT}.${RESET}"
else
  echo ""
  echo -e "${GREEN}${BOLD}✓ All pre-flight checks passed.${RESET}"
  echo -e "  Run with a bump type to compute the next version: ${BOLD}npm run preflight -- patch|minor|major${RESET}"
fi
