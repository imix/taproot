# Intent: Taproot Distribution

## Stakeholders
- **Maintainer**: sole releaser — needs a reliable, repeatable process that leaves nothing to memory and prevents partial or broken releases
- **npm users**: developers installing taproot — need each published version to be stable, tested, and correctly versioned
- **GitHub visitors**: evaluators and contributors — need releases to be visible, documented, and linked to a changelog

## Goal
Enable the taproot maintainer to publish reliable, tested releases to npm and GitHub through a single repeatable procedure — so that every published version is fully verified, correctly versioned, and accompanied by a changelog and GitHub release.

## Success Criteria
- [ ] A release can be initiated with a single command or skill invocation from a clean main branch
- [ ] No release can complete if any pre-flight check fails (tests, hierarchy validation, sync-check)
- [ ] Every published npm version has a corresponding git tag and GitHub release with a changelog
- [ ] A partial release (e.g. npm published but no git tag) is impossible — the process is atomic or stops cleanly at the failure point
- [ ] The release procedure is documented well enough for a second maintainer to execute it without assistance

## Constraints
- The local phase (pre-flight, changelog, version bump, tag, push) is initiated manually by the maintainer
- The publish phase runs in GitHub Actions CI, triggered by a tag push and gated by a required maintainer approval
- The npm token must be stored only as a GitHub Environment secret — never on the maintainer's local machine, in any file, or in any skill output
- npm publish uses `--provenance` so every published version has a cryptographic attestation linking it to the CI workflow run

## Behaviours <!-- taproot-managed -->
- [Cut Release](./cut-release/usecase.md)
- [Publish VS Code Extension](./vscode-marketplace/usecase.md)
- [CI Pipeline](./ci-pipeline/usecase.md)

## Status
- **State:** active
- **Created:** 2026-03-21
- **Last reviewed:** 2026-03-24

## Notes
- First release target: v0.1.0 — the project is approaching a releaseable state with 46+ implemented behaviours
- The release process should enforce the same quality bar as any other taproot implementation: tests passing, hierarchy consistent, documentation current
