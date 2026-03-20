# Implementation: Multi-Surface — config, validation, orphans, plan, coverage

## Behaviour
../usecase.md

## Design Decisions
- `deferred` state check in `check-orphans` reads the impl state before any file-existence checks — skips source/test/commit checks entirely for deferred impls, not just suppresses them
- `plan.ts` skips behaviours with `specState === 'deferred'`; deferred impls are filtered out when computing `allComplete` and `inProgressCount` so a `specified` behaviour whose only impl is `deferred` remains a plan candidate (AC-7)
- `coverage.ts` adds `deferredBehaviours` / `deferredImpls` to `CoverageReport.totals` — enables `tr-status` to render a Parked section from JSON without a separate CLI command
- AC-5 specific error message for `deferred` on `intent.md` is a special case in `checkStatusValue`, not a config change — `allowedIntentStates` does not include `deferred`, and the special case fires before the generic fallback
- `deferred` is added to `allowedBehaviourStates` and `allowedImplStates` in the config defaults so `validate-format` accepts it without requiring per-project config changes

## Source Files
- `src/core/config.ts` — add `deferred` to `allowedBehaviourStates` and `allowedImplStates` defaults
- `src/validators/format-rules.ts` — special-case `deferred` on intent.md with AC-5 error message
- `src/commands/check-orphans.ts` — skip MISSING_SOURCE_FILE / MISSING_TEST_FILE / UNIMPLEMENTED_BEHAVIOUR for deferred items
- `src/commands/plan.ts` — exclude deferred behaviours from candidates; filter deferred impls from allComplete/inProgress computation
- `src/commands/coverage.ts` — add deferredBehaviours/deferredImpls to totals; exclude deferred from collectUnimplemented

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/park-hierarchy-item.test.ts` — covers AC-1 (deferred usecase not flagged), AC-2 (deferred impl with missing source not flagged), AC-3 (deferred behaviour excluded from plan), AC-5 (deferred rejected on intent.md), AC-6 (un-parked impl resumes normal checking), AC-7 (specified behaviour with deferred impl stays as plan candidate)

## DoR Resolutions
- condition: check-if-affected-by: implementation-quality/architecture-compliance | note: compliant — config change in src/core/config.ts (core layer, no I/O); validation change in src/validators/format-rules.ts (pure logic); command changes in src/commands/ (I/O at command boundary); no global mutable state; error messages include correction hints | resolved: 2026-03-20

## Status
- **State:** in-progress
- **Created:** 2026-03-20
- **Last verified:** 2026-03-20
