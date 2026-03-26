# Taproot

**AI-driven specs, enforced at commit time. Code without traceability doesn't merge.**

Taproot is a requirements hierarchy tool for teams building software with AI coding agents. It keeps a git-versioned chain from business intent → stakeholder behaviour → implementation — and enforces it at every commit.

## What it does

- **Requirement hierarchy**: Intent → UseCase → Implementation, all in plain Markdown in your repo
- **Acceptance criteria**: Gherkin-style AC embedded directly in behaviour specs
- **Pre-commit enforcement**: Hook validates specs and traces implementations before any commit lands
- **AI-agent integration**: Works with Claude Code, Cursor, Windsurf, Aider, and any agent with a CLI

## Get started

Run **Taproot: Initialize project** from the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) to set up taproot in your current workspace.

Or install via npm:

```bash
npm install -g @imix-js/taproot
taproot init
```

## Learn more

- [GitHub](https://github.com/imix-js/taproot)
- [npm](https://www.npmjs.com/package/@imix-js/taproot)
