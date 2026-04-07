# Taproot

**AI-driven specs, enforced at commit time. Code without traceability doesn't merge.**

Taproot keeps a git-versioned chain from business intent → stakeholder behaviour → implementation — and enforces it at every commit via a pre-commit hook.

## What it does

- **Requirement hierarchy**: Intent → UseCase → Implementation, all in plain Markdown in your repo
- **Acceptance criteria**: Gherkin-style AC embedded directly in behaviour specs
- **Pre-commit enforcement**: Hook validates specs and traces implementations before any commit lands
- **AI-agent integration**: Works with Cursor, Claude Code, Windsurf, Aider, and any agent with a CLI

## Get started

1. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Run **Taproot: Initialize project**
3. Taproot sets up the `taproot/` folder, installs the pre-commit hook, and configures your AI agent

> Requires Node.js 18+ and npm available in your terminal.

## Learn more

- [GitHub](https://github.com/imix/taproot)
- [npm](https://www.npmjs.com/package/@imix-js/taproot)

<!-- root-readme-sha: 6f69f2a4ce409fc12773bae23d293119b7262f27f607239ab2699ba21a6a32f5 -->
