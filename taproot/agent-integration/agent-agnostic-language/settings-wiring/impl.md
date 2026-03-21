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
- `.taproot/settings.yaml` — adds `check-if-affected-by: agent-integration/agent-agnostic-language` to `definitionOfDone`

## Commits
<!-- taproot-managed -->

## Tests
- (no automated test — agent-driven check; verified by DoD runner's existing check-if-affected-by integration test coverage)

## Status
- **State:** in-progress
- **Created:** 2026-03-21
- **Last verified:** 2026-03-21

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: not applicable — implementation writes only .taproot/settings.yaml (a config file); no code design decisions; no architectural constraints apply | resolved: 2026-03-21
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: not applicable — usecase.md has no NFR-N entries | resolved: 2026-03-21
