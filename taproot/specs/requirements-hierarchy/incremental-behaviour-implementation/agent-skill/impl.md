# Implementation: Agent Skill — incremental behaviour delivery convention

## Behaviour
../usecase.md

## Design Decisions
- Convention-only implementation — no new CLI commands or data structures required. The behaviour is surfaced entirely through the pattern-check step in `tr-behaviour` and `tr-ineed`, which already scan `docs/patterns.md` at invocation time.
- `docs/patterns.md` is the canonical home for this pattern (added in spec commit). The impl adds explicit signal phrases to `behaviour.md`'s hardcoded pattern-check step so phased-delivery language is reliably caught even without reading the full patterns file.
- Pattern A (sub-behaviours) is the recommended default. Pattern B (AC-scoped impl) is an explicitly supported alternative for same-shape flows. Both are documented with concrete examples and selection criteria.
- The signal phrases chosen ("start with", "implement part of", "defer some ACs", "only do X for now", "MVP of this behaviour") reflect natural language developers use when scoping partial delivery — not taproot jargon.

## Source Files
- `docs/patterns.md` — incremental delivery pattern entry with signal phrases and examples (added in spec commit `000471e`)
- `skills/behaviour.md` — added explicit phased-delivery signal to pattern-check step
- `taproot/agent/skills/behaviour.md` — installed copy of above

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/patterns.test.ts` — verifies incremental delivery pattern is present in docs/patterns.md with required signal phrases and spec link (covers AC-1 discoverability)

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — convention-only implementation; no source code architecture affected. Changes are to skill markdown files and docs/patterns.md. No architectural constraints from docs/architecture.md apply. | resolved: 2026-03-29
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: NOT APPLICABLE — parent usecase.md contains no NFR-N entries. This behaviour has no performance, security, or reliability thresholds. | resolved: 2026-03-29

## Status
- **State:** in-progress
- **Created:** 2026-03-29
- **Last verified:** 2026-03-29
