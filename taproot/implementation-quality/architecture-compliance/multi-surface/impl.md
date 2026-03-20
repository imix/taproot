# Implementation: Multi-surface — config + architecture doc

## Behaviour
../usecase.md

## Design Decisions
- Activated via `check-if-affected-by: implementation-quality/architecture-compliance` in `definitionOfReady` — reuses existing DoR runner agent-check machinery; no new runner code needed
- `docs/architecture.md` is a freeform document, not a usecase — captures decisions, constraints, and patterns the team has agreed on
- AC-4 (missing architecture doc): the DoR runner will fail the check as unresolved; a capable agent resolving it will surface the missing doc. A machine-readable guard (`run: test -f docs/architecture.md`) is deferred as a future enhancement.

## Source Files
- `.taproot/settings.yaml` — adds `check-if-affected-by: implementation-quality/architecture-compliance` to `definitionOfReady`
- `docs/architecture.md` — the architecture document; its existence is the precondition for the check to run

## Commits
- (run `taproot link-commits` to populate)
- `1d869f7b3e68613f7bc481cb9a909301ca7752a4` — (auto-linked by taproot link-commits)
- `0b4b1eb3dea6f7ee3b513d576c8d71d0bef4ca25` — (auto-linked by taproot link-commits)
- `8dcbc6703ebe3fa8c65e172ca309832ae2ae4089` — (auto-linked by taproot link-commits)

## Tests
- (no automated test — activation is verified by the DoR runner's existing `check-if-affected-by` test coverage; the architecture doc's content is human-maintained)

## Status
- **State:** complete
- **Created:** 2026-03-20
- **Last verified:** 2026-03-20

## DoD Resolutions
- condition: document-current | note: docs/configuration.md updated: added check-if-affected-by to DoR condition syntax and documented architecture compliance use case with reference to docs/architecture.md. docs/architecture.md created as the architecture reference document. README.md and other docs/ files not affected. | resolved: 2026-03-20T13:38:11.010Z
- condition: sessions-convention | note: docs/architecture.md updated: added _sessions/ scratch space convention. Architecture doc remains accurate and actionable. | resolved: 2026-03-20T20:13:47.707Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — architecture-compliance implementation writes docs/architecture.md and updates .taproot/settings.yaml. Neither is a skill file (skills/*.md) containing git commit steps. commit-awareness constraints do not apply. | resolved: 2026-03-20T20:03:59.590Z

- condition: check-if-affected-by: implementation-quality/architecture-compliance | note: this IS the architecture compliance implementation — self-referentially compliant by definition | resolved: 2026-03-20T13:43:59.658Z
- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: yes — architecture compliance pre-check is a reusable pattern; however it is already captured in docs/patterns.md indirectly via check-if-affected-by, and the specific use case is documented in docs/configuration.md. No new pattern entry needed. | resolved: 2026-03-20T13:39:40.782Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: yes — added check-if-affected-by: implementation-quality/architecture-compliance to definitionOfReady in settings.yaml; this is itself the cross-cutting concern | resolved: 2026-03-20T13:39:40.553Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — no skill or agent interaction surface added | resolved: 2026-03-20T13:39:31.278Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — no skill file added or modified by this implementation | resolved: 2026-03-20T13:39:31.046Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — implementation writes two files (settings.yaml and docs/architecture.md) but these are part of a single atomic activation step, not a multi-document skill flow requiring developer confirmation between each | resolved: 2026-03-20T13:39:24.219Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — this implementation adds a config entry and a doc file; it produces no agent-facing output and has no What's next? interaction surface | resolved: 2026-03-20T13:39:23.980Z

- condition: check-if-affected: skills/guide.md | note: not affected — guide.md covers skill commands and CLI usage; architecture compliance is a configuration concern covered in docs/configuration.md | resolved: 2026-03-20T13:38:17.310Z

- condition: check-if-affected: src/commands/update.ts | note: not affected — update.ts handles skill/adapter file refreshing; it does not manage settings.yaml or docs/architecture.md | resolved: 2026-03-20T13:38:17.074Z

