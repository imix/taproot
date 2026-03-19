# Implementation: CLI Command — taproot plan

## Behaviour
../usecase.md

## Design Decisions
- AFK/HITL classification uses the behaviour's `usecase.md` state field as a deterministic proxy: `specified` → AFK (spec is complete, ready to implement); `proposed` → HITL (spec needs human review); `implemented` with in-progress impls → AFK (resumable). This replaces the agent-reasoning approach with a concrete, testable rule.
- Behaviours with all `complete` implementations are excluded — only gaps are shown.
- Sort order: AFK before HITL, then alphabetical within each group — surfaces the most actionable items first.
- Output hints include the exact `/tr-implement` or `/tr-behaviour` invocation so the developer can act immediately.
- `--format json` enables machine consumption (CI tooling, agent pipelines).

## Source Files
- `src/commands/plan.ts` — command logic, candidate collection, AFK/HITL classification, tree and JSON formatters
- `src/cli.ts` — registers `taproot plan`

## Commits
- (run `taproot link-commits` to populate)
- `fd719c805c016069f1c629c5f53427ea1ead548a` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/plan.test.ts` — covers: AFK candidate detection (specified), HITL candidate detection (proposed), in-progress impl detection, fully-implemented hierarchy (all-implemented message), intent goal propagation, sort order (AFK before HITL), tree format output, JSON format output

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-03-19
