# Implementation: Multi-surface — config + architecture doc

## Behaviour
../usecase.md

## Design Decisions
- Activated via `check-if-affected-by: quality-gates/architecture-compliance` in `definitionOfReady` — reuses existing DoR runner agent-check machinery; no new runner code needed
- `docs/architecture.md` is a freeform document, not a usecase — captures decisions, constraints, and patterns the team has agreed on
- AC-4 (missing architecture doc): the DoR runner will fail the check as unresolved; a capable agent resolving it will surface the missing doc. A machine-readable guard (`run: test -f docs/architecture.md`) is deferred as a future enhancement.

## Source Files
- `taproot/settings.yaml` — adds `check-if-affected-by: quality-gates/architecture-compliance` to `definitionOfReady`
- `docs/architecture.md` — the architecture document; its existence is the precondition for the check to run

## Commits
- (run `taproot link-commits` to populate)
- `1d869f7b3e68613f7bc481cb9a909301ca7752a4` — (auto-linked by taproot link-commits)
- `0b4b1eb3dea6f7ee3b513d576c8d71d0bef4ca25` — (auto-linked by taproot link-commits)
- `8dcbc6703ebe3fa8c65e172ca309832ae2ae4089` — (auto-linked by taproot link-commits)
- `d8c82575e7c43dfba2552afd9c29224af63d2ae5` — (auto-linked by taproot link-commits)
- `bf03522ac3d00a4b869a2bb5430ea35234ade36f` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/architecture-compliance.test.ts` — activation regression (settings.yaml entry present, docs/architecture.md exists); DoR runner behaviour (check pending until agent resolves, check passes once resolution recorded)

## Status
- **State:** complete
- **Created:** 2026-03-20
- **Last verified:** 2026-04-11

## DoD Resolutions
- condition: document-current | note: docs/configuration.md updated: added check-if-affected-by to DoR condition syntax and documented architecture compliance use case with reference to docs/architecture.md. docs/architecture.md created as the architecture reference document. README.md and other docs/ files not affected. | resolved: 2026-03-20T13:38:11.010Z
- condition: check-if-affected: examples/ | note: not affected — staleness verification only; examples demonstrate hierarchy structure, not architecture compliance configuration | resolved: 2026-04-11T06:38:21.818Z

- condition: check-if-affected: package.json | note: not affected — staleness verification only; no code changes, no new dependencies | resolved: 2026-04-11T06:38:21.517Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: no new concern — this is a staleness verification only; settings.yaml entry unchanged, docs/architecture.md unchanged; Last verified date update only | resolved: 2026-04-11T06:38:12.758Z

- condition: check-if-affected-by: agent-integration/portable-output-patterns | note: not applicable — source files are taproot/settings.yaml and docs/architecture.md; no skill file modified; portable-output-patterns governs skill files (skills/*.md) only | resolved: 2026-04-11T06:38:01.315Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: not applicable — this change adds a test file and updates impl.md only; no skill file (skills/*.md) is modified | resolved: 2026-03-25T08:59:38.539Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: not applicable — adding integration tests introduces no agent-facing output, no new section headers, and no language-dependent content; the test file is TypeScript with English identifiers only | resolved: 2026-03-25T08:59:32.615Z

- condition: check-if-affected: docs/ | note: adding integration tests does not affect any docs/ file — tests cover existing CLI and config behaviour with no new user-facing surface | resolved: 2026-03-25T08:59:27.120Z

- condition: sessions-convention | note: docs/architecture.md updated: added _sessions/ scratch space convention. Architecture doc remains accurate and actionable. | resolved: 2026-03-20T20:13:47.707Z
- condition: no-raw-exceptions | note: docs/architecture.md updated with "No raw exceptions to the user" constraint. Constraint is self-enforcing via check-if-affected-by: quality-gates/architecture-compliance. | resolved: 2026-03-21

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — architecture-compliance implementation writes docs/architecture.md and updates taproot/settings.yaml. Neither is a skill file (skills/*.md) containing git commit steps. commit-awareness constraints do not apply. | resolved: 2026-03-20T20:03:59.590Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: this IS the architecture compliance implementation — self-referentially compliant by definition | resolved: 2026-03-20T13:43:59.658Z
- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: yes — architecture compliance pre-check is a reusable pattern; however it is already captured in docs/patterns.md indirectly via check-if-affected-by, and the specific use case is documented in docs/configuration.md. No new pattern entry needed. | resolved: 2026-03-20T13:39:40.782Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: yes — added check-if-affected-by: quality-gates/architecture-compliance to definitionOfReady in settings.yaml; this is itself the cross-cutting concern | resolved: 2026-03-20T13:39:40.553Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — no skill or agent interaction surface added | resolved: 2026-03-20T13:39:31.278Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — no skill file added or modified by this implementation | resolved: 2026-03-20T13:39:31.046Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — implementation writes two files (settings.yaml and docs/architecture.md) but these are part of a single atomic activation step, not a multi-document skill flow requiring developer confirmation between each | resolved: 2026-03-20T13:39:24.219Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — this implementation adds a config entry and a doc file; it produces no agent-facing output and has no What's next? interaction surface | resolved: 2026-03-20T13:39:23.980Z

- condition: check-if-affected: skills/guide.md | note: not affected — guide.md covers skill commands and CLI usage; architecture compliance is a configuration concern covered in docs/configuration.md | resolved: 2026-03-20T13:38:17.310Z

- condition: check-if-affected: src/commands/update.ts | note: not affected — update.ts handles skill/adapter file refreshing; it does not manage settings.yaml or docs/architecture.md | resolved: 2026-03-20T13:38:17.074Z

