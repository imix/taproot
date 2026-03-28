# Implementation: CI Job — update-homebrew-tap

## Behaviour
../usecase.md

## Design Decisions
- Implemented as a separate `update-homebrew-tap` job in `.github/workflows/release.yml` that `needs: publish` — it runs only after npm publish succeeds, ensuring the tarball is available
- Uses `continue-on-error: true` at the job level so a tap failure never blocks or retriggers the publish job (AC-2: Homebrew is a secondary channel)
- Token check is the first step — fails fast with a clear message if `HOMEBREW_TAP_TOKEN` is absent (AC-3)
- SHA256 computed with `sha256sum` on the actual downloaded tarball, not hardcoded (AC-4)
- Clones `imix/homebrew-tap` with `HOMEBREW_TAP_TOKEN` as the credential; uses `sed` to update `url`, `sha256`, and `version` fields in-place in `Formula/taproot.rb`
- Commit message is `taproot vX.Y.Z` — simple, scannable in the tap repo history
- Job runs in the `release` environment (same as `publish`) to access `HOMEBREW_TAP_TOKEN`
- No Ruby or Homebrew tooling installed in CI — the formula update is pure string substitution via `sed`

## Source Files
- `.github/workflows/release.yml` — added `update-homebrew-tap` job after `publish`

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/homebrew-tap.test.ts` — structural: job present in release.yml, needs publish, continue-on-error, token check step present, sha256 computation step present, formula update step present

## Status
- **State:** in-progress
- **Created:** 2026-03-28
- **Last verified:** 2026-03-28

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: not applicable — CI workflow file only; no TypeScript source, no external API calls from taproot codebase; job runs in GitHub Actions | resolved: 2026-03-28
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: not applicable — usecase.md contains no NFR-N entries; no performance thresholds to implement | resolved: 2026-03-28

## Notes
- **Initial formula setup (one-time):** Before the CI job runs for the first time, a maintainer must create `Formula/taproot.rb` in the `imix/homebrew-tap` repository:
  ```ruby
  class Taproot < Formula
    desc "Requirement hierarchy tool for AI-assisted development"
    homepage "https://github.com/imix-js/taproot"
    url "https://github.com/imix-js/taproot/archive/refs/tags/v0.1.0.tar.gz"
    sha256 "PLACEHOLDER"
    version "0.1.0"
    license "MIT"

    depends_on "node"

    def install
      system "npm", "install", "--prefix", prefix, "--production", "."
      bin.install Dir["node_modules/.bin/taproot"].first => "taproot"
    end

    test do
      system "#{bin}/taproot", "--version"
    end
  end
  ```
- The CI job replaces the `url`, `sha256`, and `version` fields via `sed` — the formula file must exist before the job runs.
