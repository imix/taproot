---
name: 'tr-taproot'
description: 'Taproot configuration quick reference — settings.yaml options and how to apply them'
---

# Taproot — Configuration Reference

This file is a quick reference for configuring taproot. Read it when asked to change taproot settings (language, vocabulary, definition of done, etc.).

## Configuration Quick Reference

Edit `taproot/settings.yaml` to configure taproot. Run `taproot update` after changes.

| Option | Type | Description |
|--------|------|-------------|
| `language` | string | Language pack for section headers and keywords (e.g. `de`, `fr`, `es`). Default: English. |
| `vocabulary` | map | Domain-specific term substitutions in skill output (e.g. `feature: story`). |
| `definitionOfDone` | list | Shell commands run as gates before implementation commits. |
| `cli` | string | CLI invocation prefix. Default: `npx @imix-js/taproot`. Override: `cli: taproot` (global install). |

See `taproot/agent/CONFIGURATION.md` for the full reference and examples.

<!-- taproot:cli-invocation: node dist/cli.js -->
When running taproot commands in this project, replace bare `taproot` with: `node dist/cli.js`
Example: `node dist/cli.js dod taproot/some-intent/some-behaviour/impl-name/impl.md`
