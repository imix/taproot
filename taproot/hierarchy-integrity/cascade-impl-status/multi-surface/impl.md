# Implementation: Multi-Surface — dod CLI + tr-implement skill

## Behaviour
../usecase.md

## Design Decisions
- Cascade lives in `taproot dod` (CLI) and `tr-implement` step 5a (skill) — both paths can complete an impl; either alone would leave gaps
- `cascadeUsecaseState()` exported from `dod.ts` so it can be unit-tested independently of the full DoD run
- Cascade is intentionally one-directional: `specified` → `implemented` only; reversal is a human decision
- Silent no-op when parent state is already `implemented`/beyond — prevents accidental downgrades
- Missing `usecase.md` returns null and skips silently; `validate-format` will surface the underlying structural issue

## Source Files
- `src/commands/dod.ts` — `cascadeUsecaseState()` function + calls after `markImplComplete()` in both the DoD-configured and no-DoD paths
- `src/core/dod-runner.ts` — added `usecaseCascade?: string` to `DodReport` interface
- `skills/implement.md` — step 5a updated to advance usecase state alongside adding the link section

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/dod.test.ts` — cascadeUsecaseState: advances specified→implemented, no-op if already implemented, graceful missing usecase; runDod cascade: cascades on pass, skips on dry-run, skips on fail

## Status
- **State:** in-progress
- **Created:** 2026-03-19
