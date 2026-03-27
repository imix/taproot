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
- `462b1cc457a2c6366d353ca4fb90fd57c503628c` — (auto-linked by taproot link-commits)
- `0e15c283e05d72bd917976d770ee5d253c726e43` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/park-hierarchy-item.test.ts` — covers AC-1 (deferred usecase not flagged), AC-2 (deferred impl with missing source not flagged), AC-3 (deferred behaviour excluded from plan), AC-5 (deferred rejected on intent.md), AC-6 (un-parked impl resumes normal checking), AC-7 (specified behaviour with deferred impl stays as plan candidate)

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — config change in src/core/config.ts (core layer, no I/O); validation change in src/validators/format-rules.ts (pure logic); command changes in src/commands/ (I/O at command boundary); no global mutable state; error messages include correction hints | resolved: 2026-03-20

## Status
- **State:** complete
- **Created:** 2026-03-20
- **Last verified:** 2026-03-20

## DoD Resolutions
- condition: document-current | note: Updated docs/concepts.md: added deferred to state table and added explanatory paragraph. Updated docs/configuration.md: added deferred to allowed_behaviour_states and allowed_impl_states examples. update.ts propagates skill/adapter files only — not affected. skills/guide.md has no state references — not affected. | resolved: 2026-03-20T17:59:49.767Z
- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — park-hierarchy-item impl modifies state validation and deferred lifecycle logic; it does not touch any skill that reads git state or references commits | resolved: 2026-03-21T11:06:36.626Z

- condition: document-current | note: no docs changes needed for this story — NFR-N is a spec format concern; park-hierarchy-item impl is complete and unaffected | resolved: 2026-03-21T11:05:53.342Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — deferred state is a lifecycle mechanism, not a reusable pattern; it is documented in docs/concepts.md as part of the state table | resolved: 2026-03-20T18:00:27.286Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: no — the deferred state affects multiple CLI commands but this is a first-class feature implemented directly, not a cross-cutting enforcement constraint that would need to be wired up per-implementation | resolved: 2026-03-20T18:00:27.053Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — all changes respect module boundaries: config defaults in src/core/config.ts, pure validation logic in src/validators/format-rules.ts, I/O-boundary changes in src/commands/; no global mutable state introduced; error message for deferred-on-intent.md includes correction hint (use deprecated instead) | resolved: 2026-03-20T18:00:26.822Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — pattern-hints applies to agent skills that process user-expressed needs via the taproot skill system; this is a CLI and validator change | resolved: 2026-03-20T18:00:18.356Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — context-engineering applies to skill files (skills/*.md); this implementation modifies CLI commands and validators | resolved: 2026-03-20T18:00:18.112Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — pause-and-confirm applies to skills that write multiple documents in sequence requiring human confirmation; this implementation modifies existing CLI commands and validators | resolved: 2026-03-20T18:00:17.878Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — this is a multi-surface CLI/validator change, not an agent skill; contextual-next-steps applies to skills that produce interactive output with a What's next? block | resolved: 2026-03-20T18:00:17.645Z

- condition: check-if-affected: skills/guide.md | note: not affected — guide.md is an onboarding document; it does not enumerate valid state values; developers learn about deferred state from docs/concepts.md | resolved: 2026-03-20T17:59:56.710Z

- condition: check-if-affected: src/commands/update.ts | note: not affected — update.ts propagates skill and adapter files to agent directories; deferred state is a validation and planning concern handled in config.ts, format-rules.ts, check-orphans.ts, plan.ts, and coverage.ts; no changes to the update command needed | resolved: 2026-03-20T17:59:56.481Z

