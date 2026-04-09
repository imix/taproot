# Implementation: Settings Wiring

## Behaviour
../usecase.md

## Design Decisions
- Wired as a `definitionOfDone` condition (not `definitionOfReady`) — the language standard applies when committing code that touches shared skill/spec files, not at declaration time
- Agent-driven check: at DoD time the agent scans the staged diff for bare "Claude"/"Claude Code" references in shared skill files and for `@{project-root}` syntax outside adapter files (`.claude/commands/`)
- Semantic compliance (e.g. "does this step implicitly assume Claude's tool set?") is human-review only — not automated; the DoD gate handles string-match violations only
- Existing violations in files not recently touched are explicitly exempt per the usecase.md Notes ("Migration and scope of enforcement") — the gate only fires when a file's impl.md is staged
- No automated test — agent-driven reasoning check; activation is verified by the DoD runner's existing `check-if-affected-by` test coverage

## Source Files
- `taproot/settings.yaml` — adds `check-if-affected-by: agent-integration/agent-agnostic-language` to `definitionOfDone`

## Commits
<!-- taproot-managed -->
- `a1537e028cd293aed2425fbc985cff5c90f021eb` — (auto-linked by taproot link-commits)
- `97b1b4d13ca0803f41fe16848e2e887b10230c0a` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/agent-agnostic-language.test.ts`

## Status
- **State:** complete
- **Created:** 2026-03-21
- **Last verified:** 2026-04-09

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: not applicable — implementation writes only taproot/settings.yaml (a config file); no code design decisions; no architectural constraints apply | resolved: 2026-03-21
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: not applicable — usecase.md has no NFR-N entries | resolved: 2026-03-21

## DoD Resolutions
- condition: document-current | note: docs/configuration.md updated: added Built-in cross-cutting DoD conditions table documenting agent-agnostic-language and all other check-if-affected-by conditions with descriptions | resolved: 2026-03-21T17:21:39.053Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: not applicable — no skill files modified, only a test file added | resolved: 2026-03-28T16:22:08.516Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: no — adding a test is not a cross-cutting architectural concern | resolved: 2026-03-28T16:22:08.261Z

- condition: check-if-affected: examples/ | note: test file only — no examples changes | resolved: 2026-03-28T16:22:08.006Z

- condition: check-if-affected: docs/ | note: test file only — no docs changes needed | resolved: 2026-03-28T16:22:07.740Z

- condition: check-if-affected: package.json | note: test file only — no new CLI commands or dependencies | resolved: 2026-03-28T16:22:07.471Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — agent-agnostic language is an instance of the existing check-if-affected-by pattern already in docs/patterns.md | resolved: 2026-03-21T17:21:41.575Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: yes — this story IS the cross-cutting concern; check-if-affected-by: agent-integration/agent-agnostic-language added to definitionOfDone | resolved: 2026-03-21T17:21:41.346Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: not applicable — implementation writes taproot/settings.yaml (config) and docs/configuration.md (doc); no code design decisions | resolved: 2026-03-21T17:21:41.119Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — no skill or agent interaction surface added | resolved: 2026-03-21T17:21:40.891Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — implementation writes settings.yaml and docs; no skill containing git commit steps was added or modified | resolved: 2026-03-21T17:21:40.663Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — no skill file added or modified | resolved: 2026-03-21T17:21:40.431Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — writes two files as a single atomic activation step; not a multi-document skill flow requiring confirmation | resolved: 2026-03-21T17:21:40.202Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — implementation writes settings.yaml and docs/configuration.md; no agent-facing output and no What's next? interaction surface | resolved: 2026-03-21T17:21:39.977Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: this IS the agent-agnostic-language implementation — self-referentially compliant; implementation writes only taproot/settings.yaml and docs/configuration.md | resolved: 2026-03-21T17:21:39.746Z

- condition: check-if-affected: skills/guide.md | note: not affected — guide.md covers skill invocation; the DoD condition is a configuration concern documented in docs/configuration.md | resolved: 2026-03-21T17:21:39.518Z

- condition: check-if-affected: src/commands/update.ts | note: not affected — update.ts propagates skill/adapter files; it does not manage settings.yaml | resolved: 2026-03-21T17:21:39.287Z

