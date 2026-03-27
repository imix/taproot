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
- `1b43978f48e64eb234dc317884f17a1630605981` — (auto-linked by taproot link-commits)
- `0ca60a2cd1c1ec50e2ec4d135b6346b5b11b3eb2` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/vscode-extension.test.ts` — reads `vscode-extension/package.json` and asserts: (AC-6) command `taproot.init` with title "Taproot: Initialize project" present in `contributes.commands`; (AC-7) at least one walkthrough with at least one step present in `contributes.walkthroughs`

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: Not affected. The implementation adds a standalone `vscode-extension/` directory and a new CI job in `release.yml`. Neither touches the taproot CLI architecture (src/commands/, src/core/, module boundaries, or filesystem-as-data-model constraints). The extension is a separate artifact with its own toolchain. | resolved: 2026-03-26
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: Not applicable — the parent usecase.md contains no NFR-N entries. | resolved: 2026-03-26

## Notes
Remaining before DoD can pass:
- **Icon** — add `icon.png` (128×128px) and `icon` field to `vscode-extension/package.json`
- **Lockfile** — run `npm install` in `vscode-extension/` to generate `package-lock.json`; CI uses `npm ci`
- **Release skill** — update `skills/release.md` to bump `vscode-extension/package.json` version alongside root `package.json`
- **GitHub secrets** — `VSCE_PAT` and `OVSX_PAT` must be added to the `release` environment
- **Publisher account** — create `imix-ai` publisher at marketplace.visualstudio.com/manage

## Status
- **State:** deferred
- **Created:** 2026-03-26
- **Last verified:** 2026-03-26

## DoD Resolutions
- condition: document-current: README.md and docs/ accurately reflect all currently implemented CLI commands, skills, and configuration options | note: Not applicable. This implementation adds a VS Code extension (vscode-extension/) and a CI publish job (release.yml). Neither introduces new CLI commands, skill files, or configuration options. The docs/ and README.md describe taproot CLI usage — unchanged by this implementation. | resolved: 2026-03-26T08:46:29.862Z
- condition: document-current | note: Not applicable. This implementation adds a VS Code extension (vscode-extension/) and a CI publish job (release.yml). Neither introduces new CLI commands, skill files, or configuration options. The docs/ and README.md describe taproot CLI usage — unchanged by this implementation. | resolved: 2026-03-26T08:49:08.656Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: Not applicable. No skill files were created or modified. The CI workflow uses GitHub Actions secret references — no credentials are hardcoded in any file. | resolved: 2026-03-26T08:48:24.392Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: No. Adding a publish job to release.yml for a new distribution channel is straightforward CI configuration — not a reusable taproot pattern worth formalising. | resolved: 2026-03-26T08:48:18.698Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: No. The VS Code extension is a distribution artifact; its publish mechanism is not a cross-cutting constraint on taproot implementations. No new settings.yaml entry needed. | resolved: 2026-03-26T08:48:17.346Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: Compliant. Checked against docs/architecture.md: vscode-extension/ is a standalone artifact with its own toolchain, not part of the taproot CLI module hierarchy. The CI workflow addition is infrastructure, not application code. No violations of filesystem-as-data-model, module boundaries, stateless CLI, or other architectural constraints. | resolved: 2026-03-26T08:47:35.349Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: Not applicable. Pattern-hints applies to agent skills processing natural language inputs. No skill files modified. | resolved: 2026-03-26T08:47:28.839Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: Not applicable. Commit-awareness applies to skill files that include a git commit step. No skill files modified. | resolved: 2026-03-26T08:47:27.521Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: Not applicable. Context-engineering applies to skills/*.md files being created or revised. No skill files were created or modified in this implementation. | resolved: 2026-03-26T08:47:26.183Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: Not applicable. Pause-and-confirm applies to skills that write multiple documents in sequence. No skill files modified. | resolved: 2026-03-26T08:47:24.893Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: Not applicable. Contextual-next-steps applies to taproot skills that produce output. This implementation is a VS Code extension + CI workflow — neither is a skill producing a taproot output session. | resolved: 2026-03-26T08:47:09.411Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: Not applicable. This spec applies to skills/*.md files and taproot/ hierarchy docs. The modified files are .github/workflows/release.yml, vscode-extension/ source files, and a Related-section update in cut-release/usecase.md. The usecase.md update uses only generic language. No skill files created or modified. | resolved: 2026-03-26T08:47:02.409Z

- condition: check-if-affected: examples/ | note: Not affected. Examples demonstrate taproot hierarchy usage patterns. Distribution/publish mechanisms are not covered in examples. | resolved: 2026-03-26T08:46:55.650Z

- condition: check-if-affected: docs/ | note: Not affected. No docs describe CI workflows or distribution channel mechanics at this level of detail. The implementation does not change any CLI commands, configuration schema, or concepts documented in docs/. | resolved: 2026-03-26T08:46:49.481Z

- condition: check-if-affected: skills/guide.md | note: Not affected. The guide describes taproot workflow, slash commands, and CLI tools. This implementation adds a VS Code Marketplace distribution channel — no new commands or workflow steps are added. | resolved: 2026-03-26T08:46:40.951Z

- condition: check-if-affected: src/commands/update.ts | note: Not affected. The update command refreshes agent adapters and skills from the installed taproot package. This implementation adds a VS Code extension and CI workflow — neither is managed by taproot update. | resolved: 2026-03-26T08:46:35.751Z

