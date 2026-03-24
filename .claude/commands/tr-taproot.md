---
name: 'tr-taproot'
description: 'Taproot configuration quick reference — settings.yaml options and how to apply them'
---

# Taproot — Configuration Reference

This file is a quick reference for configuring taproot. Read it when asked to change taproot settings (language, vocabulary, definition of done, etc.).

## Configuration Quick Reference

Edit `.taproot/settings.yaml` to configure taproot. Run `taproot update` after changes.

| Option | Type | Description |
|--------|------|-------------|
| `language` | string | Language pack for section headers and keywords (e.g. `de`, `fr`, `es`). Default: English. |
| `vocabulary` | map | Domain-specific term substitutions in skill output (e.g. `feature: story`). |
| `definitionOfDone` | list | Shell commands run as gates before implementation commits. |

See `.taproot/CONFIGURATION.md` for the full reference and examples.
