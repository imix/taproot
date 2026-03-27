# Implementation: All Levels

## Behaviour
../usecase.md

## Design Decisions
- **Unified truth check block**: the truth session validation was moved out of the `requirement` tier and into a single unified block that runs after all tier-specific checks. This ensures one session hash covers all staged docs (hierarchy docs + impl.md + source file paths), matching what `truth-sign` produces.
- **Source file identity via path list**: impl-level commits hash source file paths (sorted, joined) rather than their content. This anchors the session to the staged file set without requiring re-signing on content edits after staging — consistent with the semantic nature of agent review.
- **Backward-compatible**: for pure requirement commits (only hierarchy docs staged), the unified block collects the same docs and truths as before. All 34 existing requirement-tier truth tests pass unchanged.
- **Baseline DoR unchanged**: the `baseline-usecase-exists` check already gates impl commits on usecase.md presence. Tests needed a usecase.md in the setup to satisfy this.

## Source Files
- `src/commands/commithook.ts` — unified truth check block replacing requirement-only check
- `src/commands/truth-sign.ts` — extended to include impl.md + source file paths in session hash
- `skills/commit.md` — step 4 added to implementation sub-flow (truth check before staging)
- `.taproot/skills/commit.md` — synced from skills/commit.md

## Commits
- placeholder

## Tests
- `test/integration/truth-checker.test.ts` — AC-7: impl source commit blocked without session; AC-7 pass: session covers impl level; AC-8: scope ladder — behaviour commit excludes impl truths; AC-9: session invalidated when staged source files change; AC-10: enforcement automatic (no settings.yaml entry needed)

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: this change restructures commithook.ts — the truth check block moves from inside the requirement tier to a standalone unified block at the end of runCommithook. No new modules, no new CLI commands. Pattern is the same as the existing requirement-tier truth check. Compliant. | resolved: 2026-03-27
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: no new NFRs. The session hash computation is the same deterministic SHA-256 as before; extending it to cover impl-level staged files does not change the performance or measurability characteristics. | resolved: 2026-03-27

## Status
- **State:** in-progress
- **Created:** 2026-03-27
- **Last verified:** 2026-03-27
