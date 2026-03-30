# Implementation: GitHub Actions Workflow

## Behaviour
../usecase.md

## Design Decisions
- **Single `scan` job (not parallel):** The spec flow diagram shows semgrep and syft/grype running in parallel, but a single sequential job is simpler for v1 — fewer artefact-download steps, no job fan-in complexity, and the runtime difference is negligible for a small project. Can be split into parallel jobs if scan time becomes a bottleneck.
- **`compile-security-report.js` extracts the threshold gate:** Threshold filtering logic lives in `scripts/compile-security-report.js` (exportable functions + CLI entry point) rather than inline bash. This makes it unit-testable and keeps the YAML readable.
- **semgrep run with `|| true`, threshold applied in report script:** semgrep exits non-zero when findings are present. Capturing the JSON output first and applying the threshold in the report script avoids bash exit-code gymnastics and gives a clean "N findings above threshold" failure message rather than a raw semgrep non-zero exit.
- **grype run without `--fail-on`, threshold in report script:** Same rationale as semgrep. Allows the report script to unify the exit decision after counting findings from both tools.
- **Tool version pinning:** semgrep pinned via pip (`==1.62.0`), syft and grype pinned via install scripts (`v0.104.0`, `v0.79.4`). Prevents unexpected scan failures from upstream rule or tool changes.
- **SBOM format:** Syft JSON (`syft-json`) — default format, sufficient for grype input. Noted in usecase.md Notes if downstream tooling requires SPDX/CycloneDX.
- **Artefact retention:** 90 days (GitHub Actions default) as specified in usecase.md Notes.
- **Pre-release gate via `workflow_call`:** `security-scan.yml` declares a `workflow_call` trigger. `release.yml` calls it as a reusable workflow in a `security-scan` job that gates `publish` (i.e. `publish` has `needs: [ci, security-scan]`).

## Source Files
- `.github/workflows/security-scan.yml` — reusable workflow: nightly schedule, manual trigger, and `workflow_call` for the pre-release gate; installs and runs semgrep + syft + grype; compiles report via `compile-security-report.js`; uploads artefacts with 90-day retention
- `.github/workflows/release.yml` — updated: added `security-scan` job (calls `security-scan.yml`) between `ci` and `publish`; `publish` now depends on `[ci, security-scan]`
- `scripts/compile-security-report.js` — ESM Node.js script: filters semgrep and grype JSON outputs by severity threshold; writes a markdown report; exits 1 if findings detected; exports `filterSemgrepFindings`, `filterGrypeFindings`, `buildReport` for testing

## Commits
<!-- taproot-managed -->
- `12b038edcb2c56b1d34777546e72e3eb2a2ccf35` — (auto-linked by taproot link-commits)
- `f5f9c5a3eda6838631d3c5dc766572539a397444` — (auto-linked by taproot link-commits)

## Tests
- `test/unit/security-scan.test.ts` — validates workflow YAML structure (all three triggers, threshold validation, tool installs, ruleset names, SBOM generation, artefact upload with 90-day retention, `compile-security-report.js` invocation); validates release.yml pre-release gate wiring; validates `compile-security-report.js` exports and output content

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: Not applicable — implementation is CI workflow files (.github/workflows/security-scan.yml, release.yml update) and a standalone Node.js helper script (scripts/compile-security-report.js). No taproot core modules (src/commands/, src/core/, src/adapters/) are modified. None of the architectural constraints (filesystem-as-data-model, stateless CLI, module boundaries) apply to workflow YAML or a standalone CI script. | resolved: 2026-03-30
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: Not applicable — the parent usecase.md has no **NFR-N:** entries. The only NFR (local scan execution time) was deferred when local scanning was dropped from scope; no NFR criteria remain in the spec. | resolved: 2026-03-30

## Status
- **State:** complete
- **Created:** 2026-03-30
- **Last verified:** 2026-03-30

## DoD Resolutions
- condition: check-if-affected: skills/guide.md | note: not applicable — no skills/*.md files in Source Files (.github/workflows/security-scan.yml, .github/workflows/release.yml, scripts/compile-security-report.js); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-30T08:59:17.537Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: Not applicable — no skill files (skills/*.md or taproot/agent/skills/*.md) were modified in this implementation. | resolved: 2026-03-30T09:01:06.140Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: No. Using GitHub Actions reusable workflows for CI gates is standard GitHub Actions practice, not a novel taproot pattern. | resolved: 2026-03-30T09:01:05.870Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: No. The security-scanning workflow is a CI-specific implementation concern. It does not introduce a new architectural rule or taproot-level convention that would apply to future implementations. | resolved: 2026-03-30T09:01:05.616Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: Not applicable — implementation is CI workflow files and a standalone Node.js helper script. No taproot core modules (src/commands/, src/core/, src/adapters/) modified. Architectural constraints (filesystem-as-data-model, stateless CLI, module boundaries, no global mutable state) do not apply to workflow YAML or a standalone CI script. | resolved: 2026-03-30T09:00:55.718Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: Not applicable — no skill files modified. pattern-hints applies to skills that produce output or guide the user through choices. This implementation consists of CI workflow files and a helper script; no skill instructions changed. | resolved: 2026-03-30T09:00:55.459Z

- condition: check-if-affected: examples/ | note: No examples/ directory exists in this project. Not affected. | resolved: 2026-03-30T09:00:55.198Z

- condition: check-if-affected: docs/ | note: Updated docs/security.md Supply Chain Controls section: added semgrep entry and reference to .github/workflows/security-scan.yml. No other docs/ files needed updating — CLI reference, concepts, configuration, and workflows docs do not cover CI security scanning implementation details. | resolved: 2026-03-30T09:00:45.570Z

- condition: check-if-affected: src/commands/update.ts | note: No new skill files, CLI commands, or adapter types registered. update.ts installs skill files and adapter templates — none of the new files (.github/workflows/security-scan.yml, scripts/compile-security-report.js) are distributed via taproot update. Not affected. | resolved: 2026-03-30T09:00:45.312Z

- condition: check-if-affected: package.json | note: No new npm dependencies added. semgrep, syft, and grype are installed inside the CI workflow environment (via pip and curl), not as npm packages. No scripts added to package.json. Not affected. | resolved: 2026-03-30T09:00:45.050Z

- condition: document-current | note: Read README.md (no security scanning references — appropriate, product readme only) and docs/security.md (references Syft and Grype but was missing semgrep and the workflow file reference). Updated docs/security.md Supply Chain Controls section to add semgrep entry and reference .github/workflows/security-scan.yml. docs/cli.md, docs/concepts.md, docs/configuration.md, docs/workflows.md: none reference or need to reference CI security scanning workflow — no changes needed. | resolved: 2026-03-30T09:00:34.994Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — no skills/*.md files in Source Files (.github/workflows/security-scan.yml, .github/workflows/release.yml, scripts/compile-security-report.js); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-30T08:59:17.547Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — no skills/*.md files in Source Files (.github/workflows/security-scan.yml, .github/workflows/release.yml, scripts/compile-security-report.js); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-30T08:59:17.539Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — no skills/*.md files in Source Files (.github/workflows/security-scan.yml, .github/workflows/release.yml, scripts/compile-security-report.js); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-30T08:59:17.539Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — no skills/*.md files in Source Files (.github/workflows/security-scan.yml, .github/workflows/release.yml, scripts/compile-security-report.js); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-30T08:59:17.538Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: not applicable — no skills/*.md files in Source Files (.github/workflows/security-scan.yml, .github/workflows/release.yml, scripts/compile-security-report.js); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-30T08:59:17.538Z

