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
- Releases are initiated manually by the maintainer — no automated CI-triggered publishing (for now)
- npm publish requires maintainer credentials — the process must not embed credentials in the hierarchy or skill files
- The process must be executable on the maintainer's local machine without additional infrastructure

## Behaviours <!-- taproot-managed -->
- [Cut Release](./cut-release/usecase.md)

## Status
- **State:** active
- **Created:** 2026-03-21
- **Last reviewed:** 2026-03-21

## Notes
- First release target: v0.1.0 — the project is approaching a releaseable state with 46+ implemented behaviours
- The release process should enforce the same quality bar as any other taproot implementation: tests passing, hierarchy consistent, documentation current
