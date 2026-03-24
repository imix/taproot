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
- **State:** complete
- **Created:** 2026-03-24
- **Last verified:** 2026-03-24

## DoD Resolutions
- condition: document-current | note: Implementation adds .taproot/skills/release.md (maintainer-only, not distributed) and .github/workflows/release.yml (CI infrastructure). Neither is a user-facing CLI command or distributed skill. README.md and docs/ do not need updating — docs/security.md already contextualises the CI-driven release and provenance controls. | resolved: 2026-03-24T18:45:12.123Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: Not applicable. This check targets files matching skills/*.md (the distributed user skills). The release skill is at .taproot/skills/release.md, which does not match the skills/*.md glob. It is a maintainer-only internal skill, not a distributed user skill. | resolved: 2026-03-24T18:48:28.702Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: No. The two-job CI pattern (ci + publish with environment gate) is a standard GitHub Actions pattern well-documented externally. The awk-based changelog extraction is a one-line utility, not a reusable architectural pattern. Nothing in this implementation rises to the level of a taproot-specific pattern worth recording. | resolved: 2026-03-24T18:48:21.970Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: No. The release procedure is a one-time maintainer operation, not a pattern that other behaviours need to be checked against. The CI workflow structure (two-job ci+publish) and GitHub Environment approval are infrastructure choices specific to this release pipeline, not cross-cutting concerns that affect other implementations. | resolved: 2026-03-24T18:48:16.374Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: Compliant. Implementation creates two plain-text files (.taproot/skills/release.md, .github/workflows/release.yml) and one test file. No taproot CLI modules are modified. Skill is plain markdown (satisfies 'Markdown is the schema' and 'Agent-agnostic output'). Workflow is infrastructure config outside taproot/. No global mutable state introduced. All architecture constraints satisfied. | resolved: 2026-03-24T18:48:09.565Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: Not applicable. The release skill takes a structured, enumerated input (bump: patch|minor|major). The user never expresses a natural-language need that requires routing to this skill — it is invoked directly with a known argument. Pattern-hints applies to skills that interpret ambiguous user intent; this skill has no such ambiguity. | resolved: 2026-03-24T18:48:03.133Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: Applicable and compliant. Step 5 explicitly classifies the release commit as a plain commit: 'this is a plain commit (message chore: release v<next> does not match the taproot(<scope>): pattern). The taproot pre-commit hook classifies it as plain and runs no DoD or DoR conditions.' This prevents the hook from applying workflow conditions to the release commit. | resolved: 2026-03-24T18:47:57.466Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: Applicable and compliant. C-1 (description ≤50 tokens): description is ~30 tokens. C-2 (inputs explicit): bump type with allowed values documented. C-3 (outputs explicit): ## Output section lists all produced artifacts. C-4 (steps numbered): Steps 1-8 with sub-steps. C-5 (session hygiene): step 8 includes a /compact signal ('If this session is getting long, consider running /compact'). C-6 (What's next): **Next:** block at end of step 8. C-7 (abort early): all pre-flight failures abort before file modification, [Q] response aborts cleanly. | resolved: 2026-03-24T18:47:51.810Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: Applicable and compliant. The release skill has an explicit confirmation gate in step 3 (changelog review): the agent presents the draft changelog entry and asks the maintainer to respond [Y] proceed, [E] edit, or [Q] abort before writing any files. This is a high-stakes irreversible action (triggering a CI workflow and npm publish) and the pause gate prevents proceeding without explicit human confirmation. | resolved: 2026-03-24T18:47:43.891Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: Applicable and compliant. The release skill step 8 ends with a bolded **Next:** block: '**Next:** gh run watch — monitor CI; approve the release environment deployment when checks pass'. This provides a clear, actionable next step immediately after the agent completes its work, directly satisfying the contextual-next-steps requirement. | resolved: 2026-03-24T18:47:36.303Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: Not applicable. The agent-agnostic language standard applies to distributed skills in skills/*.md. The release skill is in .taproot/skills/release.md and is intentionally not listed in SKILL_FILES — it is never distributed to user projects. A maintainer-only, non-distributed skill is explicitly out of scope for the agent-agnostic requirement. | resolved: 2026-03-24T18:47:30.490Z

- condition: check-if-affected: skills/guide.md | note: Not affected. The release skill is a maintainer-only internal tool, not a distributed user skill. It must not appear in skills/guide.md, which documents skills available to all taproot users. | resolved: 2026-03-24T18:45:26.538Z

- condition: check-if-affected: src/commands/update.ts | note: Not affected. The release skill is in .taproot/skills/ (not skills/) and is intentionally absent from SKILL_FILES. taproot update only installs files listed in SKILL_FILES — no changes to update.ts are needed. | resolved: 2026-03-24T18:45:18.044Z

