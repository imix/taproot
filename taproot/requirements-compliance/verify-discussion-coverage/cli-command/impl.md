# Implementation: CLI Command (DoR hook check)

## Behaviour
../usecase.md

## Design Decisions
- New `require-discussion-log` variant added to `DodConditionEntry` union in `src/validators/types.ts` — same pattern as existing `check-if-affected-by` and `document-current` variants; only one new case in the union, kept the type narrowing consistent.
- Handler placed in `src/core/dor-runner.ts` within the existing `dorConditions` loop, alongside other agent-check entries — same structure, same `results.push` pattern; the check is purely structural (existence check, no file read).
- Opted for existence-only check as specified: no content validation, no section checking — a skeleton `discussion.md` satisfies the hook. Quality review is the developer's responsibility (noted in spec).
- AC-4 (settings error doesn't block) is satisfied structurally: if `loadConfig` fails, the `dorConditions` array is empty and the loop body never executes, so `require-discussion-log` is never evaluated.
- `relative(cwd, implDir)` in the output message gives a short, readable path in the rejection message: `discussion.md missing in taproot/intent/behaviour/impl/`.
- `dod-runner.ts` also needed a `require-discussion-log` case in `resolveCondition` — without it, TypeScript narrows the union to `{ run: string; ... }` and the final fallthrough reference to `entry.run` and `entry.name` fails to type-check.

## Source Files
- `src/validators/types.ts` — added `| { 'require-discussion-log': boolean }` variant to `DodConditionEntry`
- `src/core/dor-runner.ts` — added `require-discussion-log` handler branch; added `relative` to path imports
- `src/core/dod-runner.ts` — added `require-discussion-log` case in `resolveCondition` for type safety
- `docs/configuration.md` — documented `require-discussion-log` option under Definition of Ready
- `test/integration/commithook.test.ts` — AC-1/2/3 tests for require-discussion-log in runDorChecks

## Commits
<!-- taproot-managed -->

## Tests
- `test/integration/commithook.test.ts` — AC-1: passes with discussion.md present; AC-2: fails with message when absent; AC-3: check skipped when not configured

## Status
- **State:** in-progress
- **Created:** 2026-03-25

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — handler added in src/core/dor-runner.ts using existsSync (consistent with existing dor-runner.ts I/O pattern); new DodConditionEntry variant in src/validators/types.ts follows existing union type pattern; error message includes correction hint per architecture error-messages constraint | resolved: 2026-03-25T12:10:00.000Z
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: NOT APPLICABLE — no NFR entries in usecase.md; the behaviour has no performance targets, security thresholds, or measurability requirements | resolved: 2026-03-25T12:10:00.000Z
