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
- `ff06649838aef276d70df83eb02b63ce76ec068e` — (auto-linked by taproot link-commits)
- `cf15270fea292369e4be063745a2f5404497d95b` — (auto-linked by taproot link-commits)
- `0e8605e96654c7b54104f145a916e48ab38666ed` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/homebrew-tap.test.ts` — structural: job present in release.yml, needs publish, continue-on-error, token check step present, sha256 computation step present, formula update step present

## Status
- **State:** complete
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

## DoD Resolutions
- condition: document-current | note: CI workflow change only — no new CLI commands, skills, or configuration options introduced. docs/ and README.md correctly reflect taproot's capabilities; Homebrew distribution is a deployment channel, not a user-facing CLI feature to document | resolved: 2026-03-28T08:09:35.727Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: NO skill files modified. The CI workflow uses secrets via GitHub Actions secrets mechanism (never hardcoded); token passed via environment variable HOMEBREW_TAP_TOKEN | resolved: 2026-03-28T08:13:02.577Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: NO — Homebrew tap update via CI is release-specific; not a general taproot pattern | resolved: 2026-03-28T08:13:02.314Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: NO — CI workflow addition is release infrastructure; not a reusable constraint applicable to taproot implementations | resolved: 2026-03-28T08:13:02.049Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — CI workflow addition; no TypeScript changes, no new external dependencies from the taproot package, no database or API calls from taproot codebase; follows existing release.yml job pattern | resolved: 2026-03-28T08:12:11.897Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — no skill or spec file modified; pattern-hints governs agent skill content | resolved: 2026-03-28T08:12:11.641Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — no skill file with git commit steps created or modified; the CI workflow commit is in GitHub Actions, not an agent skill | resolved: 2026-03-28T08:12:11.384Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — no skill file created or modified; context-engineering governs taproot skill file design | resolved: 2026-03-28T08:12:11.127Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — CI workflow job; no agent skill producing multi-document output; pause-and-confirm governs agent skill interactions with the developer | resolved: 2026-03-28T08:12:10.864Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — CI workflow job; no agent skill file created or modified; contextual-next-steps applies to taproot agent skills that produce output | resolved: 2026-03-28T08:12:10.609Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: not applicable — CI workflow file (.github/workflows/release.yml); no taproot skill or spec content modified; agent-agnostic-language governs taproot artifact language, not GitHub Actions YAML | resolved: 2026-03-28T08:12:10.353Z

- condition: check-if-affected: examples/ | note: not affected — examples are starter templates unrelated to CI release workflow | resolved: 2026-03-28T08:09:36.781Z

- condition: check-if-affected: docs/ | note: not affected — no new CLI commands or options; Homebrew distribution is already mentioned in docs/cli.md as a planned channel; no additional docs update needed for a CI job addition | resolved: 2026-03-28T08:09:36.526Z

- condition: check-if-affected: skills/guide.md | note: not affected — guide.md covers taproot skills; this is a CI workflow change for distribution | resolved: 2026-03-28T08:09:36.262Z

- condition: check-if-affected: src/commands/update.ts | note: not affected — no skill files added or modified; update.ts manages skill installation only | resolved: 2026-03-28T08:09:35.998Z

