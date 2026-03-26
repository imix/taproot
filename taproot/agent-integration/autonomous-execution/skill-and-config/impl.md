# Implementation: Skill Files + Config Support

## Behaviour
../usecase.md

## Design Decisions
- Autonomous mode awareness lives in the skill markdown files — the agent reads and follows skill instructions, so behavior changes belong where instructions are defined, not in the CLI. Adding a runtime flag to the CLI would not help because skills are text executed by the agent, not by the taproot process.
- Three activation mechanisms (env var `TAPROOT_AUTONOMOUS=1`, `--autonomous` flag, `autonomous: true` in settings) are documented in skills as a "check autonomous mode" preamble that the agent reads at skill load time. No CLI orchestration is needed.
- `autonomous?: boolean` added to `TaprootConfig` so `autonomous: true` in `.taproot/settings.yaml` is a first-class supported setting — parsed, typed, and discoverable via CONFIGURATION.md.
- Only `skills/implement.md` and `skills/commit.md` carry explicit confirmation prompts that autonomous mode should bypass. Other skills (tr-plan, tr-status, etc.) present structured choices but do not block on user approval before acting — no changes needed there.
- `<!-- autonomous: pending-review -->` is a pure skill-text convention. No CLI parsing is needed because the marker is written into `impl.md` by the agent following skill instructions; `taproot dod` already reads `## DoD Resolutions` entries by convention.
- The CONFIGURATION.md generator is updated so `.taproot/CONFIGURATION.md` (the agent-facing config reference) documents `autonomous` alongside `cli` and `language` — the three runtime-behavior settings.

## Source Files
- `src/validators/types.ts` — adds `autonomous?: boolean` to `TaprootConfig`
- `src/core/configuration.ts` — adds `autonomous` section to generated `.taproot/CONFIGURATION.md`
- `skills/implement.md` — adds autonomous mode preamble and conditional at plan-approval step (step 4)
- `skills/commit.md` — adds autonomous mode conditional at staging confirmation step (step 3)
- `docs/configuration.md` — documents `autonomous` setting under a new section

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/autonomous-execution.test.ts` — AC-6: `autonomous: true` in settings.yaml parsed correctly; settings without `autonomous` leave it undefined (no implicit activation); CONFIGURATION.md generator includes `autonomous` entry

## Status
- **State:** in-progress
- **Created:** 2026-03-26
- **Last verified:** 2026-03-26

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — changes are confined to `src/validators/types.ts` (type definition), `src/core/configuration.ts` (CONFIGURATION.md generator), `src/adapters/` (adapter generation), and skill markdown files. No new commands, no global state, no cross-layer imports. Config field follows established `deepMerge` pattern. No architectural constraints violated. | resolved: 2026-03-26
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: not applicable — parent usecase.md has no `**NFR-N:**` entries. | resolved: 2026-03-26
