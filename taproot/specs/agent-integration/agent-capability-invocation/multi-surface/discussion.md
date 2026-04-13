# Discussion: Multi-Surface — Adapter Capability Maps + Skill Authoring Guide

## Session
- **Date:** 2026-04-13
- **Skill:** tr-implement

## Pivotal Questions

**Where does the capability map live?** Options were: (a) separate file, (b) in each launcher, (c) in guide.md only. Chose (b) — embedded in each launcher alongside the CLI invocation note — because the agent must have the translation available the moment it loads a skill, without a separate lookup step.

**What about non-Claude adapters?** No equivalent to `/compact` is known for Cursor, Copilot, Windsurf, Gemini, or Generic. Chose generic fallback advisory for all — adds the protocol without false promises of native support.

## Alternatives Considered
- **Centralised capability file** (e.g. `taproot/agent/capabilities.md`) — rejected: requires an extra file read mid-skill-execution; the launcher pattern is already proven for per-skill context.
- **guide.md only** — rejected: guide.md is on-demand; agents executing a skill mid-session would not have it loaded.

## Decision
Embed a `<!-- taproot:capabilities -->` block in each Claude launcher (similar to `<!-- taproot:cli-invocation -->`), and add generic fallback instructions to other adapter preambles. Document the authoring convention in `guide.md` and `docs/agents.md`.

## Open Questions
- None — Gemini/Cursor equivalents for `/compact` can be added to capability maps in a future adapter-specific implementation once the mechanisms are identified.
