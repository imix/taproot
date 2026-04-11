# Implementation: Settings Wiring

## Behaviour
../usecase.md

## Design Decisions
- Activated via `check-if-affected-by: quality-gates/nfr-measurability` in `definitionOfReady` — reuses existing DoR runner agent-check machinery; no new runner code needed
- The check is entirely agent-driven: at declaration time the agent reads the parent `usecase.md`, collects `**NFR-N:**` entries, and inspects each `Then` clause for a measurable threshold (digit+unit, named standard, or testable boolean)
- Measurability heuristics from usecase.md Notes are the authoritative reference for what "passes": number+unit (`200ms`, `60%`), named standard (`WCAG 2.1 AA`, `PCI DSS 4.0`), testable boolean ("account is locked", "notification is sent"). Pure adjectives ("fast", "secure") without qualification always fail.
- No automated test — activation is verified by the DoR runner's existing `check-if-affected-by` test coverage; threshold reasoning is agent judgement, not parseable by static tests

## Source Files
- `taproot/settings.yaml` — adds `check-if-affected-by: quality-gates/nfr-measurability` to `definitionOfReady`

## Commits
<!-- taproot-managed -->
- `3f13a2ea050faacd83d9032b5d76b0446c497e0a` — (auto-linked by taproot link-commits)
- `55bee91cfa4bdb392e81d6950429eaf6901442ba` — (auto-linked by taproot link-commits)
- `4381e4b9928fbb04194b85151c8bb3bbb3ea55b1` — (auto-linked by taproot link-commits)
- `f24530ec72ef938f54297aeb423b16e363fe48cb` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/nfr-measurability.test.ts` — activation regression (settings.yaml entry present); DoR runner behaviour (check pending until agent resolves, check passes once resolution recorded)

## Status
- **State:** complete
- **Created:** 2026-03-21
- **Last verified:** 2026-04-11

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: not applicable — implementation writes only taproot/settings.yaml (a config file); no code design decisions; no architectural constraints apply | resolved: 2026-03-21

## DoD Resolutions
- condition: document-current | note: docs/configuration.md updated: definitionOfReady section now documents both quality-gates/architecture-compliance and quality-gates/nfr-measurability as built-in DoR gates with descriptions of each | resolved: 2026-03-21T11:49:00.284Z
- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: no new concern — this is a staleness verification only; settings.yaml entry unchanged, definitionOfReady entry for quality-gates/nfr-measurability unchanged; Last verified date update only | resolved: 2026-04-11T06:41:20.507Z

- condition: check-if-affected: examples/ | note: not affected — staleness verification only; examples demonstrate hierarchy structure, not nfr-measurability configuration | resolved: 2026-04-11T06:41:10.665Z

- condition: check-if-affected: package.json | note: not affected — staleness verification only; no code changes, no new dependencies | resolved: 2026-04-11T06:41:10.664Z

- condition: check-if-affected-by: agent-integration/portable-output-patterns | note: not applicable — source files are taproot/settings.yaml only; no skill file modified; portable-output-patterns governs skill files (skills/*.md) only | resolved: 2026-04-11T06:41:10.661Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: not applicable — this change adds a test file and updates impl.md only; no skill file modified | resolved: 2026-03-25T09:14:47.977Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: not applicable — adding integration tests introduces no agent-facing output, no new section headers, and no language-dependent content | resolved: 2026-03-25T09:14:47.495Z

- condition: check-if-affected: docs/ | note: adding integration tests does not affect any docs/ file — tests verify existing config behaviour with no new user-facing surface | resolved: 2026-03-25T09:14:47.010Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — NFR measurability gate is an instance of the existing check-if-affected-by pattern already documented in docs/patterns.md; no new pattern entry needed | resolved: 2026-03-21T11:49:49.665Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: no new concern — this is a staleness verification only; settings.yaml entry unchanged, definitionOfReady entry for quality-gates/nfr-measurability unchanged; Last verified date update only | resolved: 2026-04-11T06:41:10.665Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: not applicable — implementation writes taproot/settings.yaml (a config file) and docs/configuration.md (a doc); no code design decisions; no architectural constraints apply | resolved: 2026-03-21T11:49:36.289Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — no skill or agent interaction surface added | resolved: 2026-03-21T11:49:32.540Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — implementation writes settings.yaml and docs/configuration.md; neither is a skill file containing git commit steps | resolved: 2026-03-21T11:49:28.856Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — no skill file added or modified by this implementation | resolved: 2026-03-21T11:49:23.173Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — implementation writes two files (settings.yaml and docs/configuration.md) as a single atomic activation step; not a multi-document skill flow requiring developer confirmation between each | resolved: 2026-03-21T11:49:17.953Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — implementation writes only taproot/settings.yaml and docs/configuration.md; no agent-facing output and no What's next? interaction surface | resolved: 2026-03-21T11:49:13.593Z

- condition: check-if-affected: skills/guide.md | note: not affected — guide.md covers skill commands and CLI usage; the DoR gate is a configuration concern covered in docs/configuration.md | resolved: 2026-03-21T11:49:09.117Z

- condition: check-if-affected: src/commands/update.ts | note: not affected — update.ts propagates skill and adapter files; it does not manage settings.yaml | resolved: 2026-03-21T11:49:04.879Z

