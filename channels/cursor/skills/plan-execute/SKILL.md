---
name: "tr-plan-execute"
description: "Execute items from `taproot/plan.md` one at a time (step-by-step) or in sequence (batch), with optional filters to process only `spec`+`refine` items (specify mode) or only `implement` items (implement mode)"
---

Load and follow the full skill definition at `taproot/agent/skills/plan-execute.md` in the current workspace.

Follow every step in the skill's `## Steps` section precisely and in order. Use the `cli:` value from `taproot/settings.yaml` for all taproot CLI commands (default: `taproot`).
