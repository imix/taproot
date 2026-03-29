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
- **State:** complete
- **Created:** 2026-03-29
- **Last verified:** 2026-03-29

## DoD Resolutions
- condition: document-current | note: docs/patterns.md updated with incremental delivery pattern (spec commit 000471e). No new CLI commands or config options introduced. README and docs/ accurately reflect all implemented features. | resolved: 2026-03-29T12:52:37.862Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: COMPLIANT — change adds one signal phrase line to pattern-check step. No shell commands, no credentials, no tokens. Agent reads patterns.md and surfaces a hint only. | resolved: 2026-03-29T13:09:32.502Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: YES — already done. Incremental behaviour delivery pattern added to docs/patterns.md in spec commit 000471e. | resolved: 2026-03-29T13:09:32.243Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: NO — adding a pattern signal to behaviour.md is not a cross-cutting concern for settings.yaml. | resolved: 2026-03-29T13:09:31.983Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — convention-only implementation; no architectural decisions made. docs/architecture.md constraints unaffected. | resolved: 2026-03-29T13:08:02.177Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: COMPLIANT — this implementation IS a pattern-hint enhancement. New signal phrase follows the existing pattern-check format exactly. | resolved: 2026-03-29T13:08:01.893Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: NOT APPLICABLE — behaviour.md makes no commits; it delegates to other skills. | resolved: 2026-03-29T13:08:01.606Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: COMPLIANT — added one line to pattern-check step. Minimal context increase (~15 tokens). /compact signal and What's next? block already present. | resolved: 2026-03-29T13:08:01.322Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: COMPLIANT — pattern-check already pauses for developer confirmation when a match is found ([A]/[B] choice). The new signal follows the same existing branch. | resolved: 2026-03-29T13:02:10.451Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: COMPLIANT — behaviour.md already has What's next? block. This change adds a signal phrase to pattern-check step only; output structure unaffected. | resolved: 2026-03-29T13:02:10.165Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: COMPLIANT — behaviour.md signal phrase uses no agent-specific names. Generic language throughout. | resolved: 2026-03-29T13:02:09.901Z

- condition: check-if-affected: examples/ | note: No examples exercise this pattern directly. Not applicable. | resolved: 2026-03-29T12:52:55.000Z

- condition: check-if-affected: docs/ | note: docs/patterns.md already updated in spec commit. No other docs affected. | resolved: 2026-03-29T12:52:54.712Z

- condition: check-if-affected: skills/guide.md | note: guide.md description of /tr-behaviour remains accurate — this is an internal pattern-check enhancement, not a new public capability. | resolved: 2026-03-29T12:52:54.445Z

- condition: check-if-affected: src/commands/update.ts | note: update.ts copies skill files by name. behaviour.md filename unchanged — no update needed. | resolved: 2026-03-29T12:52:38.416Z

- condition: check-if-affected: package.json | note: No new dependencies or version bump. Skill-only change. | resolved: 2026-03-29T12:52:38.131Z

