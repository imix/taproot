# Implementation: Multi-surface — agent skill + CI workflow

## Behaviour
../usecase.md

## Design Decisions
- **Skill location `.taproot/skills/release.md` (not `skills/`)**: `installSkills()` only copies files listed in `SKILL_FILES`; anything in `.taproot/skills/` not in that list is safe from `taproot update` overwrites. No code changes needed to prevent distribution.
- **Two-job workflow (`ci` + `publish`)**: CI checks run in the `ci` job with no environment gate so they start immediately on tag push. `publish` runs in a separate job that `needs: ci` and declares `environment: release`. The approval request only appears after CI passes — the maintainer is never asked to approve a release that would immediately fail.
- **`id-token: write` on `publish` job only**: The OIDC token required for npm provenance attestation is scoped to the publish job only, following the least-privilege principle from `docs/security.md`.
- **Changelog extraction via awk**: The GitHub release body is extracted from CHANGELOG.md using `awk` to match the entry for the released version. No external dependencies or scripts required.
- **`<!-- entries below -->` marker in CHANGELOG.md**: The skill inserts new entries after this marker line, making insertion deterministic without full file parsing.

## Source Files
- `.taproot/skills/release.md` — local agent skill: maintainer's release procedure (pre-flight checks, changelog generation, version bump, commit, tag, push)
- `.github/workflows/release.yml` — GitHub Actions workflow: CI checks → approval gate (`release` environment) → `npm publish --provenance` → GitHub release

## Commits
<!-- taproot link-commits will fill this -->

## Tests
- `test/unit/release-skill.test.ts` — verifies skill file structure (heading, required sections, numbered steps, all pre-flight checks referenced); verifies workflow YAML (trigger pattern, two-job structure, environment gate, `--provenance` flag, `NPM_TOKEN` secret, `id-token: write` permission)

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: Implementation creates two plain-text files (.taproot/skills/release.md, .github/workflows/release.yml) and one test file. No taproot CLI modules are modified. Skill is plain markdown (compliant with "Markdown is the schema" and "Agent-agnostic output"). Workflow is infrastructure config outside taproot/. No global mutable state introduced. Compliant with all architecture constraints. | resolved: 2026-03-24
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: NFR-1 in usecase.md states "zero files in the working tree have been modified — the state is identical to before the release was invoked." This is a testable boolean condition (git status --porcelain returns empty output). Measurable. Covered by test that verifies pre-flight checks abort before file modification. | resolved: 2026-03-24

## Status
- **State:** in-progress
- **Created:** 2026-03-24
- **Last verified:** 2026-03-24
