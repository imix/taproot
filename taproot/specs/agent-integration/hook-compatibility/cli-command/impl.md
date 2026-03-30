# Implementation: CLI Command — hook compatibility fixes

## Behaviour
../usecase.md

## Design Decisions
- **Error messages reference CLI, not slash commands** — `validateTruthSession()` in `truth-checker.ts` emits messages that name `taproot truth-sign` and `.taproot/.truth-check-session` explicitly; no agent-specific slash commands. All three error paths (missing, malformed, stale) updated.
- **`taproot commit` as primary guidance** — since the commit wrapper (P10) now exists, adapter guidance directs all agents to use `taproot commit` rather than the manual 3-step sequence; fallback manual instructions included for agents that bypass it.
- **Commit guidance added to all 5 adapter builders** — Cursor, Copilot, Windsurf, Generic, and Aider each have a section explaining `taproot commit`; no adapter-specific knowledge required by the hook itself.

## Source Files
- `src/core/truth-checker.ts` — fix 3 error message strings: `/tr-commit` → CLI commands
- `src/adapters/index.ts` — add commit/truth-sign guidance to all 5 adapter builder functions

## Commits
<!-- taproot-managed -->

## Tests
- AC-1, AC-2, AC-3: verified by reading `truth-checker.ts` — no `/tr-commit` references remain
- AC-4, AC-5: verified by reading `adapters/index.ts` — all 5 adapters contain `taproot commit` and `taproot truth-sign` guidance
- AC-6: missing-session error now includes both CLI command and session file name

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — error message strings are pure data in truth-checker.ts (no logic change); adapter additions are string literals in builder functions. No I/O boundary changes. | resolved: 2026-03-30
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: NOT APPLICABLE — no NFR criteria in this spec; the changes are error message strings and adapter documentation only. | resolved: 2026-03-30

## Status
- **State:** in-progress
- **Created:** 2026-03-30
- **Last verified:** 2026-03-30
