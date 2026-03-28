# Implementation: GitHub Actions Workflow

## Behaviour
../usecase.md

## Design Decisions
- Node.js 20 pinned — matches the existing `release.yml` workflow; ensures CI and release environments are consistent
- Step order follows the spec exactly: build first (catches compilation errors before running validators), then validate-structure/format/check-orphans (use built dist/cli.js), then npm audit, then npm test
- `node dist/cli.js` used for validation commands (not bare `taproot`) — avoids a global install step and uses the project's own built CLI; ensures the validated CLI is the one being tested
- Single job `validate` — all steps in one job so a failure short-circuits remaining steps via GitHub Actions default behaviour
- Triggers: `push` to main + `pull_request` (targets main by default) — matches AC-1

## Source Files
- `.github/workflows/taproot-ci.yml` — the GitHub Actions workflow file

## Commits
- placeholder
- `5f39db036ef48941ce7f1316687e09f5b8570e33` — (auto-linked by taproot link-commits)
- `35bd7824f8471cbe15b6328b3ac2d60bb9af4571` — (auto-linked by taproot link-commits)

## Tests
- No automated test file — workflow correctness is verified by GitHub Actions execution; AC-1 through AC-9 are verified by reading the workflow file

## Status
- **State:** complete
- **Created:** 2026-03-27
- **Last verified:** 2026-03-27

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: not applicable — this is a GitHub Actions YAML file, not a CLI source file; architecture-compliance governs TypeScript CLI commands | resolved: 2026-03-27
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: not applicable — CI pipeline is infrastructure/automation; no new NFRs introduced; workflow steps are pass/fail with no measurable performance constraints | resolved: 2026-03-27

## DoD Resolutions
- condition: document-current | note: not applicable — this change adds a GitHub Actions workflow file, not a CLI command, skill, or configuration option; README.md and docs/ do not need updating | resolved: 2026-03-27T21:04:04.859Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: not applicable — this change adds a GitHub Actions YAML file, not a skill file | resolved: 2026-03-27T21:04:53.583Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — standard GitHub Actions workflow pattern; nothing novel to document | resolved: 2026-03-27T21:04:53.324Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: no — CI workflow is a one-off infrastructure file; no new cross-cutting concern introduced | resolved: 2026-03-27T21:04:53.065Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: not applicable — this is a GitHub Actions YAML file, not a TypeScript CLI command; architecture-compliance governs CLI source structure | resolved: 2026-03-27T21:04:52.797Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — pattern-hints governs agent skill output hints; CI pipeline is GitHub Actions automation | resolved: 2026-03-27T21:04:52.525Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — commit-awareness governs the tr-commit skill behaviour; CI pipeline does not make commits | resolved: 2026-03-27T21:04:27.514Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — this is a GitHub Actions YAML file, not a skill; context engineering governs skill prompt construction | resolved: 2026-03-27T21:04:27.254Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — CI pipeline is fully automated; no interactive pause-and-confirm steps | resolved: 2026-03-27T21:04:26.990Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — CI pipeline runs in GitHub Actions automation, not in an agent-human interaction context | resolved: 2026-03-27T21:04:26.738Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: not applicable — this is a GitHub Actions YAML file with no natural language instructions for agents | resolved: 2026-03-27T21:04:26.480Z

- condition: check-if-affected: examples/ | note: not applicable — examples already have the canonical taproot/ layout; the CI workflow is a taproot repo concern, not a starter template concern | resolved: 2026-03-27T21:04:05.886Z

- condition: check-if-affected: docs/ | note: not applicable — this adds a GitHub Actions workflow; no new CLI commands, skills, or config options introduced that would need docs/ updates | resolved: 2026-03-27T21:04:05.634Z

- condition: check-if-affected: skills/guide.md | note: not applicable — guide.md covers taproot workflow for developers; CI pipeline is infrastructure and does not change the taproot developer workflow guide | resolved: 2026-03-27T21:04:05.373Z

- condition: check-if-affected: src/commands/update.ts | note: not applicable — this adds a GitHub Actions YAML file; update.ts handles taproot update command which copies skill files, not CI workflow files | resolved: 2026-03-27T21:04:05.113Z

