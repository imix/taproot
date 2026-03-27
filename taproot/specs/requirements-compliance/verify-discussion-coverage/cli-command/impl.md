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
- `777f396dab0025ab4ef12366f387526f57412327` — (auto-linked by taproot link-commits)
- `feeb6bcbfc6a7336adfd712231e157a191acdc55` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/commithook.test.ts` — AC-1: passes with discussion.md present; AC-2: fails with message when absent; AC-3: check skipped when not configured

## Status
- **State:** complete
- **Created:** 2026-03-25

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — handler added in src/core/dor-runner.ts using existsSync (consistent with existing dor-runner.ts I/O pattern); new DodConditionEntry variant in src/validators/types.ts follows existing union type pattern; error message includes correction hint per architecture error-messages constraint | resolved: 2026-03-25T12:10:00.000Z
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: NOT APPLICABLE — no NFR entries in usecase.md; the behaviour has no performance targets, security thresholds, or measurability requirements | resolved: 2026-03-25T12:10:00.000Z

## DoD Resolutions
- condition: document-current | note: docs/configuration.md updated with require-discussion-log option under Definition of Ready section. README.md does not document individual settings.yaml conditions. No further changes needed. | resolved: 2026-03-25T12:26:10.034Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: NOT APPLICABLE — no skill files modified; this implementation modifies TypeScript source and docs/configuration.md only. | resolved: 2026-03-25T12:26:13.786Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: NO — the require-discussion-log condition is a standalone opt-in enforcement hook; not a reusable architectural pattern. | resolved: 2026-03-25T12:26:13.507Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: NO — require-discussion-log is itself a DoR condition teams configure explicitly; not a cross-cutting concern. | resolved: 2026-03-25T12:26:13.244Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — handler in src/core/dor-runner.ts uses existsSync (consistent with existing pattern); DodConditionEntry variant follows existing union type pattern; error message includes correction hint per architecture constraint. | resolved: 2026-03-25T12:26:12.993Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: NOT APPLICABLE — no skill files modified. | resolved: 2026-03-25T12:26:12.740Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: NOT APPLICABLE — no skill files modified. | resolved: 2026-03-25T12:26:12.489Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: NOT APPLICABLE — no skill files modified. | resolved: 2026-03-25T12:26:12.242Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: NOT APPLICABLE — no skill files modified. | resolved: 2026-03-25T12:26:11.991Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: NOT APPLICABLE — no skill files modified. | resolved: 2026-03-25T12:26:11.728Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: NOT APPLICABLE — no skill files or agent adapter files were modified. | resolved: 2026-03-25T12:26:11.479Z

- condition: check-if-affected: examples/ | note: NOT APPLICABLE — require-discussion-log is opt-in; no example project should enable it by default. | resolved: 2026-03-25T12:26:11.232Z

- condition: check-if-affected: docs/ | note: APPLIED — docs/configuration.md updated with require-discussion-log option. | resolved: 2026-03-25T12:26:10.980Z

- condition: check-if-affected: skills/guide.md | note: NOT APPLICABLE — guide.md documents CLI commands and slash commands. require-discussion-log is a settings.yaml configuration option documented in docs/configuration.md. | resolved: 2026-03-25T12:26:10.726Z

- condition: check-if-affected: src/commands/update.ts | note: NOT APPLICABLE — taproot update regenerates skills and adapter files; it does not parse or validate definitionOfReady condition entries. | resolved: 2026-03-25T12:26:10.421Z

