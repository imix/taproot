# Implementation: VS Code Extension and CI Publish

## Behaviour
../usecase.md

## Design Decisions
- **Extension source in `vscode-extension/`**: self-contained directory with its own `package.json`, `tsconfig.json`, and `src/`. Keeps VS Code extension tooling isolated from the root npm workspace — `vsce` and `@types/vscode` are not installed globally.
- **TypeScript compiled to `out/`**: standard VS Code extension convention; `out/extension.js` is the `main` entry point. The `.vscodeignore` excludes `src/` and dev files from the `.vsix`.
- **`taproot.init` opens an integrated terminal**: VS Code's `createTerminal` + `sendText` is the minimal, reliable approach for running a CLI command in the user's workspace. No shell detection, no path resolution — `npx` handles the rest.
- **Publisher placeholder `taproot-dev`**: the publisher name is unresolved (see spec Notes). `taproot-dev` is used throughout; must be replaced with the real publisher ID before first publish. The permanent Marketplace URL depends on this value.
- **Version kept in sync via CI pre-flight**: `vscode-extension/package.json` version must match the root `package.json` version at release time. The `publish-vscode-extension` CI job checks this before building. The release skill (`skills/release.md`) is responsible for bumping both versions together.
- **Open VSX publish is non-blocking**: `continue-on-error: true` on the Open VSX step — VS Marketplace is the primary channel. A failed Open VSX publish is logged with a manual retry command but does not fail the release.
- **CI job added to existing `release.yml`**: `publish-vscode-extension` job runs in the same `release` environment as `publish` (npm), ensuring it shares the approval gate and the same set of secrets.

## Source Files
- `vscode-extension/package.json` — extension manifest: publisher, displayName, description, keywords, categories, command contribution `taproot.init`, Get Started walkthrough definition
- `vscode-extension/src/extension.ts` — activation: registers `taproot.init` command; opens integrated terminal and runs `npx @imix-js/taproot init`
- `vscode-extension/tsconfig.json` — TypeScript config targeting CommonJS output in `out/`
- `vscode-extension/.vscodeignore` — excludes `src/`, `node_modules/`, dev config from the `.vsix` package
- `vscode-extension/README.md` — Marketplace listing content
- `.github/workflows/release.yml` — adds `publish-vscode-extension` job with pre-flight version check, `vsce package`, `vsce publish`, `ovsx publish` (non-blocking)
- `taproot/taproot-distribution/cut-release/usecase.md` — Related section updated to reference this behaviour

## Commits
<!-- taproot-managed -->

## Tests
- `test/integration/vscode-extension.test.ts` — reads `vscode-extension/package.json` and asserts: (AC-6) command `taproot.init` with title "Taproot: Initialize project" present in `contributes.commands`; (AC-7) at least one walkthrough with at least one step present in `contributes.walkthroughs`

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: Not affected. The implementation adds a standalone `vscode-extension/` directory and a new CI job in `release.yml`. Neither touches the taproot CLI architecture (src/commands/, src/core/, module boundaries, or filesystem-as-data-model constraints). The extension is a separate artifact with its own toolchain. | resolved: 2026-03-26
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: Not applicable — the parent usecase.md contains no NFR-N entries. | resolved: 2026-03-26

## Status
- **State:** in-progress
- **Created:** 2026-03-26
- **Last verified:** 2026-03-26
