# Discussion: GitHub Actions Workflow

## Session
- **Date:** 2026-03-30
- **Skill:** tr-implement

## Pivotal Questions

**1. Single job or parallel jobs?**
The spec flow diagram shows semgrep and syft/grype running in parallel from the CI trigger. Parallel jobs would require artefact upload/download between jobs and a fan-in `report` job. For a small project like taproot, the sequential runtime is negligible and the single-job structure is far simpler to read, debug, and maintain. Parallel jobs deferred until scan time is a real concern.

**2. Where does the threshold gate live — bash or script?**
The threshold filtering logic (comparing semgrep `ERROR/WARNING/INFO` against `critical/high/medium/low`, counting grype matches by CVE severity) is non-trivial in bash. Extracting it into `scripts/compile-security-report.js` with exportable functions makes it testable with vitest, keeps the YAML concise, and produces a single clear exit code decision from both tools' results combined.

**3. How to integrate with release.yml?**
The spec says the security scan is a "called reusable workflow". GitHub Actions `workflow_call` is the exact mechanism — `security-scan.yml` adds a `workflow_call` trigger, and `release.yml` calls it as a job with `uses: ./.github/workflows/security-scan.yml`. The `publish` job gains `needs: [ci, security-scan]` so it cannot run if the scan fails. This is the cleanest enforcement model available in GitHub Actions.

## Alternatives Considered

- **Separate semgrep action (`returntocorp/semgrep-action`)** — rejected because it adds a third-party action dependency, makes version pinning less transparent, and the plain pip install is equally reliable in CI.
- **grype `--fail-on` flag for the gate** — rejected in favour of the report script gate, so that both tools' findings are counted together before failing. Using `--fail-on` alone would fail immediately on grype findings without counting semgrep findings in the same report.
- **Inline bash for threshold filtering** — rejected because the severity level mappings (semgrep's `ERROR/WARNING/INFO` vs grype's `critical/high/medium/low`) are non-obvious in bash and would be hard to test.

## Decision

Single GitHub Actions workflow (`security-scan.yml`) with three triggers (`schedule`, `workflow_dispatch`, `workflow_call`). Scan runs sequentially: validate threshold → install tools → semgrep SAST → syft SBOM → grype CVE scan → `compile-security-report.js` applies threshold and writes the report → upload artefacts. The `workflow_call` trigger makes it a pre-release gate callable from `release.yml` with `publish` depending on it.

## Open Questions
- None for v1.
