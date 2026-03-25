# Intent: Release

## Goal
Enable maintainers to publish a new version of the tool to users reliably and consistently, with a traceable record of what changed and why.

## Stakeholders
- **Maintainer**: needs a repeatable process for versioning, packaging, and publishing that doesn't require memorising release steps
- **User**: needs accurate changelogs and version numbers so they can decide when to upgrade
- **CI / automation**: needs a release process that can be triggered non-interactively from a pipeline

## Success Criteria
- [ ] A single command (or documented sequence) produces a correctly versioned, tagged, and published release
- [ ] Every release includes a changelog entry summarising what changed since the last version
- [ ] A failed or partial release leaves the repository in a recoverable state with no partial tags or registry uploads

## Behaviours <!-- taproot-managed -->
- [Publish Release](./publish-release/usecase.md)

## Status
- **State:** active
- **Created:** 2026-03-25
