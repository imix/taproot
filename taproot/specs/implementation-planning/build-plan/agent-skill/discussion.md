# Discussion: Agent Skill — plan-build

## Session
- **Date:** 2026-03-27
- **Skill:** tr-implement

## Pivotal Questions

1. **CLI command or agent skill?** The spec requires classification of backlog items (is this a `spec`, `implement`, or `refine`?), sequencing by inferred dependency, and interactive confirmation before writing. None of these are deterministic — they require agent reasoning. A CLI command could scan and list candidates, but classification and presentation must be agent-driven. Decision: pure skill file.

2. **What's the plan.md format?** Needed something human-readable, easy for the agent to write in one pass, and parseable by execute-plan and analyse-plan with a simple line regex. Chose a numbered list with inline status prefix (`pending|done|...`) and type tag (`[spec]|[implement]|[refine]`). Rejected a markdown table (fragile for agents to write accurately) and checkbox syntax (limited to two states).

3. **When does the existing-plan check happen?** Could interrupt at the start (before scanning) or after confirmation (before writing). After-confirmation is better — avoids stopping the agent mid-discovery to ask about the existing plan. The developer has already confirmed the new plan by the time we check.

## Alternatives Considered

- **Extend `skills/plan.md`** — rejected because `plan.md` already implements extract-next-slice (a different behaviour). Mixing concerns would make both harder to read and maintain.
- **`taproot plan-build` CLI sub-command** — rejected because classification and presentation require agent reasoning; a CLI can only list, not decide.

## Decision

Implemented as a standalone skill file `skills/plan-build.md` with adapter `/tr-plan-build`. The plan.md format is a numbered list with inline status and type tags — simple enough for an agent to write reliably, and parseable by downstream skills (execute-plan, analyse-plan) with a single regex per line.

## Open Questions

- None — format is shared with execute-plan and analyse-plan which are implemented in the same session.
