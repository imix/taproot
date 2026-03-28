#!/usr/bin/env bash
# sync-channel-readmes.sh — keep channel READMEs in sync with root README.md
#
# Usage:
#   scripts/sync-channel-readmes.sh          # update SHA markers in all channel READMEs
#   scripts/sync-channel-readmes.sh --check  # exit 1 if any channel README is out of sync
#
# How it works:
#   Each channel README embeds a <!-- root-readme-sha: <sha256> --> marker.
#   The SHA is computed from the root README.md at the time the channel README was last updated.
#   --check compares the embedded SHA against the current root README SHA.
#   If they differ, the channel README may need manual review and update.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ROOT_README="$REPO_ROOT/README.md"
CHANNELS_DIR="$REPO_ROOT/channels"
CHECK_MODE=0

if [[ "${1:-}" == "--check" ]]; then
  CHECK_MODE=1
fi

if [ ! -f "$ROOT_README" ]; then
  echo "ERROR: $ROOT_README not found" >&2
  exit 1
fi

CURRENT_SHA=$(sha256sum "$ROOT_README" | awk '{print $1}')
FAILED=0

for channel_readme in "$CHANNELS_DIR"/*/README.md; do
  [ -f "$channel_readme" ] || continue
  channel=$(basename "$(dirname "$channel_readme")")

  EMBEDDED_SHA=$(grep -oP '(?<=<!-- root-readme-sha: )[\da-f]+(?= -->)' "$channel_readme" || echo "")

  if [ -z "$EMBEDDED_SHA" ]; then
    echo "WARN: $channel_readme has no root-readme-sha marker — skipping"
    continue
  fi

  if [ "$EMBEDDED_SHA" = "$CURRENT_SHA" ]; then
    if [ "$CHECK_MODE" -eq 0 ]; then
      echo "✓ $channel: up to date"
    fi
    continue
  fi

  if [ "$CHECK_MODE" -eq 1 ]; then
    echo "✗ channels/$channel/README.md is out of sync with README.md"
    echo "  Embedded SHA: $EMBEDDED_SHA"
    echo "  Current SHA:  $CURRENT_SHA"
    echo "  Review channels/$channel/README.md against README.md, update it, then run:"
    echo "    scripts/sync-channel-readmes.sh"
    FAILED=1
  else
    # Update the embedded SHA
    sed -i "s|<!-- root-readme-sha: [a-f0-9]* -->|<!-- root-readme-sha: $CURRENT_SHA -->|" "$channel_readme"
    echo "✓ $channel: SHA updated to $CURRENT_SHA"
    echo "  Review channels/$channel/README.md to ensure its content still matches README.md"
  fi
done

if [ "$CHECK_MODE" -eq 1 ] && [ "$FAILED" -eq 0 ]; then
  echo "✓ All channel READMEs are in sync with README.md"
fi

exit $FAILED
