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

## Tests
- `test/unit/security-scan.test.ts` — validates workflow YAML structure (all three triggers, threshold validation, tool installs, ruleset names, SBOM generation, artefact upload with 90-day retention, `compile-security-report.js` invocation); validates release.yml pre-release gate wiring; validates `compile-security-report.js` exports and output content

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: Not applicable — implementation is CI workflow files (.github/workflows/security-scan.yml, release.yml update) and a standalone Node.js helper script (scripts/compile-security-report.js). No taproot core modules (src/commands/, src/core/, src/adapters/) are modified. None of the architectural constraints (filesystem-as-data-model, stateless CLI, module boundaries) apply to workflow YAML or a standalone CI script. | resolved: 2026-03-30
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: Not applicable — the parent usecase.md has no **NFR-N:** entries. The only NFR (local scan execution time) was deferred when local scanning was dropped from scope; no NFR criteria remain in the spec. | resolved: 2026-03-30

## Status
- **State:** in-progress
- **Created:** 2026-03-30
- **Last verified:** 2026-03-30
