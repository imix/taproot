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

## Tests
- No automated test file — workflow correctness is verified by GitHub Actions execution; AC-1 through AC-9 are verified by reading the workflow file

## Status
- **State:** in-progress
- **Created:** 2026-03-27
- **Last verified:** 2026-03-27

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: not applicable — this is a GitHub Actions YAML file, not a CLI source file; architecture-compliance governs TypeScript CLI commands | resolved: 2026-03-27
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: not applicable — CI pipeline is infrastructure/automation; no new NFRs introduced; workflow steps are pass/fail with no measurable performance constraints | resolved: 2026-03-27
