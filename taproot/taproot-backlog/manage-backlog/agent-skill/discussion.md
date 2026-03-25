# Discussion: Agent Skill

## Session
- **Date:** 2026-03-25
- **Skill:** tr-implement

## Pivotal Questions

**CLI command or pure skill?**
Pure skill. The behaviour is fully conversational — arg/no-arg mode detection, file read/write, and the triage loop are all natural agent turns. No computational work benefits from a standalone binary. Consistent with browse.md and grill-me.md.

**taproot update vs manual copy?**
Use `taproot update` to sync both `.taproot/skills/backlog.md` and `.claude/commands/tr-backlog.md` in one step. More reliable than manual copy and handles the agent adapter (tr-backlog.md) automatically.

**What to do with non-standard lines in backlog.md?**
Preserve and skip — avoid data loss for content the developer may have hand-edited. Report the count after triage so the developer knows they exist. Silent data loss would be worse than a minor notice.

## Alternatives Considered

- **CLI command (`taproot backlog "idea"`)** — noted in spec as a natural extension but deferred. The primary use case is mid-agent-session; CLI can be added in a follow-up behaviour.
- **Single-mode skill (capture only, separate /tr-triage)** — rejected by user during discovery. One command with arg/no-arg split is simpler and consistent with familiar tools (e.g. `git stash`).

## Decision

Pure skill implementation. `taproot update` handles all file syncing after build. Non-standard lines in the backlog file are preserved. Blank arg check added early as a defensive measure.

## Open Questions
- None.
