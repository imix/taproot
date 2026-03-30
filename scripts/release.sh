#!/usr/bin/env bash
# scripts/release.sh <version>
#
# Mechanical release phase: bump versions, commit, tag, push.
# Run AFTER:
#   1. npm run preflight -- <bump>   (checks all pass, computes version)
#   2. Agent writes CHANGELOG.md entry for <version>
#
# Usage:
#   npm run release -- 0.9.0

set -euo pipefail

VERSION="${1:-}"
GREEN='\033[0;32m'
RED='\033[0;31m'
BOLD='\033[1m'
RESET='\033[0m'

pass() { echo -e "${GREEN}✓${RESET} $1"; }
fail() { echo -e "${RED}✗${RESET} $1"; exit 1; }

# ─── Validate version ─────────────────────────────────────────────────────────
if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Usage: npm run release -- <version>"
  echo "  Example: npm run release -- 0.9.0"
  exit 1
fi

# ─── Guard: CHANGELOG.md must have an entry for this version ──────────────────
if ! grep -q "## \[${VERSION}\]" CHANGELOG.md 2>/dev/null; then
  fail "CHANGELOG.md has no entry for ${VERSION} — write the changelog entry first, then re-run."
fi
pass "CHANGELOG.md entry found for v${VERSION}"

# ─── Guard: tag must not already exist ────────────────────────────────────────
if git tag -l "v${VERSION}" | grep -q .; then
  fail "Tag v${VERSION} already exists. Delete it first if you need to re-release: git tag -d v${VERSION} && git push origin :v${VERSION}"
fi

# ─── Guard: working tree must be clean (except CHANGELOG.md and package files) ─
UNEXPECTED=$(git status --porcelain | grep -v "^.M CHANGELOG.md" | grep -v "^.M package.json" | grep -v "^.M channels/vscode/package.json" || true)
if [ -n "$UNEXPECTED" ]; then
  echo "$UNEXPECTED"
  fail "Unexpected uncommitted changes — commit or stash before releasing."
fi

# ─── Bump versions ────────────────────────────────────────────────────────────
node -e "
  const fs = require('fs');
  const files = ['package.json', 'channels/vscode/package.json'];
  for (const f of files) {
    const pkg = JSON.parse(fs.readFileSync(f, 'utf8'));
    const prev = pkg.version;
    pkg.version = '${VERSION}';
    fs.writeFileSync(f, JSON.stringify(pkg, null, 2) + '\n');
    console.log('  ' + f + ': ' + prev + ' → ${VERSION}');
  }
"
pass "Versions bumped to ${VERSION}"

# ─── Truth-sign (ensures session is fresh before commit hook runs) ────────────
node dist/cli.js truth-sign 2>/dev/null || true

# ─── Commit ───────────────────────────────────────────────────────────────────
git add package.json channels/vscode/package.json CHANGELOG.md
# Stage truth-check-session if it was written
[ -f .taproot/.truth-check-session ] && git add .taproot/.truth-check-session || true
git commit -m "chore: release v${VERSION}"
pass "Release commit created"

# ─── Tag ──────────────────────────────────────────────────────────────────────
git tag "v${VERSION}"
pass "Tag v${VERSION} created"

# ─── Push ─────────────────────────────────────────────────────────────────────
git push origin main && git push origin "v${VERSION}"
pass "Pushed commit and tag to origin"

echo ""
echo -e "${GREEN}${BOLD}✓ Local phase complete.${RESET}"
echo ""
echo "  Tag v${VERSION} pushed to origin/main — GitHub Actions CI workflow triggered."
echo ""
echo "  Monitor:  gh run watch"
echo "  Approve:  github.com/imix/taproot/actions  (approve the 'release' environment after CI passes)"
echo ""
echo "  The npm publish and GitHub release will complete after you approve the deployment."
