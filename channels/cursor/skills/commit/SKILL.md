---
name: "tr-commit"
description: "Execute the full commit procedure: classify the commit type, run the appropriate gate proactively, resolve all conditions before staging, and commit"
---

Load and follow the full skill definition at `taproot/agent/skills/commit.md` in the current workspace.

Follow every step in the skill's `## Steps` section precisely and in order. Use the `cli:` value from `taproot/settings.yaml` for all taproot CLI commands (default: `taproot`).
