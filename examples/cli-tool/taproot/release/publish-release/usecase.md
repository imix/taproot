# Behaviour: Publish Release

## Actor
Maintainer — a person with publish rights to the package registry and push access to the repository.

## Preconditions
- All changes for the release are committed and tests pass on the target branch
- The maintainer has authenticated with the package registry (e.g. `npm login`, `cargo login`, `twine` credentials configured)

## Main Flow
1. Maintainer determines the next version number following semantic versioning (major / minor / patch)
2. Maintainer updates the version in the package manifest (e.g. `package.json`, `Cargo.toml`, `pyproject.toml`)
3. Maintainer updates `CHANGELOG.md` with a summary of changes since the last release
4. Maintainer commits the version bump and changelog: `chore: release vX.Y.Z`
5. Maintainer creates a git tag: `vX.Y.Z`
6. Maintainer pushes the commit and tag to the remote
7. Maintainer publishes the package to the registry (`npm publish`, `cargo publish`, `pip publish`, etc.)
8. Users can install the new version

## Alternate Flows

### Automated release via CI
- **Trigger:** Maintainer pushes a version tag or merges a release PR; CI handles steps 7–8
- **Steps:**
  1. CI detects the tag pattern (e.g. `v*.*.*`) and triggers the publish job
  2. CI authenticates with the registry using stored credentials
  3. CI publishes the package; maintainer is notified of success or failure

### Pre-release / beta
- **Trigger:** Maintainer wants to publish a release candidate for testing before the stable release
- **Steps:**
  1. Maintainer uses a pre-release version suffix (e.g. `1.2.0-rc.1`, `1.2.0-beta.1`)
  2. Maintainer publishes to a pre-release channel or with a non-default tag (`npm publish --tag next`)
  3. Stable users are not affected; testers install via the pre-release tag

### Release fails after tag is pushed
- **Trigger:** Publish step fails after the git tag has already been pushed
- **Steps:**
  1. Maintainer deletes the remote tag (`git push origin :refs/tags/vX.Y.Z`)
  2. Maintainer fixes the root cause
  3. Maintainer re-runs the release process from step 5

## Postconditions
- A git tag `vX.Y.Z` exists on the remote
- The package is available on the registry at the published version
- `CHANGELOG.md` contains an entry for the release

## Error Conditions
- **Registry authentication failure**: publish step fails with an auth error; maintainer re-authenticates and retries
- **Version already exists on registry**: publish fails; maintainer must increment the version — already-published versions cannot be overwritten on most registries

## Acceptance Criteria

**AC-1: New version is installable after release**
- Given a maintainer has completed the release process for vX.Y.Z
- When a user runs the install command (e.g. `npm install -g mytool@X.Y.Z`)
- Then the newly published version installs successfully

**AC-2: CHANGELOG.md is updated on every release**
- Given a release is being prepared
- When the release commit is made
- Then `CHANGELOG.md` contains a new entry for the version with a summary of changes

**AC-3: Git tag is pushed alongside the release**
- Given a release is published
- When the maintainer checks the remote repository
- Then a tag `vX.Y.Z` exists pointing to the release commit

## Status
- **State:** specified
- **Created:** 2026-03-25
