# Discussion: VS Code Extension and CI Publish

## Session
- **Date:** 2026-03-26
- **Skill:** tr-implement

## Pivotal Questions

**What should the extension actually do?**
The distribution goal (marketing reach) could be satisfied with a pure Marketplace listing and no runtime functionality. However, a VS Code extension with no commands would feel broken to installers. The minimal functional baseline — one Command Palette entry that runs `taproot init` in the terminal — costs very little and makes the extension usable from the moment of install.

**Where does the version mismatch check live?**
The spec originally placed it in `cut-release`'s pre-flight (before npm publish). During implementation, this was moved to the `publish-vscode-extension` CI job itself — the job detects the mismatch as its first step and fails before building the `.vsix`. This keeps the version check co-located with the publish step it protects, without requiring `cut-release`'s pre-flight to know about the extension.

## Alternatives Considered

- **Bundling the CLI into the .vsix** — rejected; adds 10+ MB to the package, creates a stale-binary problem on every taproot release, and defeats the purpose of `npx` (always runs the latest published version).
- **VS Code "shell command" extension pattern** — some extensions simply run a shell command without registering a `vscode.window.createTerminal`. Rejected because the terminal approach is more visible to the user (they can see what ran and the output).
- **Separate `publish-vscode-extension` workflow file** — keeping it in `release.yml` as a dependent job was preferred; avoids a second workflow file and ensures VS Code publish is always part of the same release approval gate.

## Decision

Minimal extension: TypeScript activation registers one command (`taproot.init`) that opens an integrated terminal and runs `npx @imix-js/taproot init`. Manifest includes Get Started walkthrough. Published via a `publish-vscode-extension` job in `release.yml` that runs after `publish` (npm), with Open VSX as a non-blocking secondary target.

## Open Questions

- Publisher name (`taproot-dev` is a placeholder) — must be resolved and replaced before first publish.
- Should `cut-release` skill (`skills/release.md`) automatically bump `vscode-extension/package.json` version alongside root `package.json`? Currently left to the maintainer; a future refinement could automate this.
- Icon: the manifest references `icon.png` which doesn't exist yet. VS Marketplace will accept a submission without an icon for now, but it significantly reduces visual discoverability.
