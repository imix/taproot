# Implementation: CLAUDE.md — Pre-Commit Ownership Scan

## Behaviour
../usecase.md

## Design Decisions
- Implemented as a CLAUDE.md instruction rather than a skill step — this covers ad-hoc agent work that happens outside any taproot skill; CLAUDE.md is the right surface for persistent agent-level guidance
- Uses `grep -rl` scan rather than reading every impl.md — consistent with the spec's C-2 concern about O(N) reads in large hierarchies
- Announcement step (step 3) makes the scan transparent — developer sees why extra files appear in the commit
- Same content-proxy test pattern as `commit-awareness/multi-surface` — tests verify instruction phrases are present in CLAUDE.md

## Source Files
- `CLAUDE.md` — "Before committing" section: git status, grep scan, announce, taproot dod, stage impl.md files

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/unit/claude-md.test.ts` — AC-1: grep scan instruction; AC-2: plain commit fallback; AC-3/AC-4: Last verified handling; AC-5: multiple owners

## Status
- **State:** in-progress
- **Created:** 2026-03-20

## DoR Resolutions
- condition: check-if-affected-by: implementation-quality/architecture-compliance | note: compliant — implementation is a CLAUDE.md markdown addition; no source code modified; no architectural constraints affected | resolved: 2026-03-20
