---
name: "tr-plan-analyse"
description: "Analyse `taproot/plan.md` before execution: check each pending item for readiness, flag ambiguous specs, unresolved dependencies, and missing prerequisites, and produce a per-item report so the developer knows what needs fixing before executing"
---

Load and follow the full skill definition at `taproot/agent/skills/plan-analyse.md` in the current workspace.

Follow every step in the skill's `## Steps` section precisely and in order. Use the `cli:` value from `taproot/settings.yaml` for all taproot CLI commands (default: `taproot`).
