# Discussion: Browse Hierarchy Item

## Session
- **Date:** 2026-03-25
- **Skill:** tr-behaviour

## Pivotal Questions

**Should this merge with `/tr-audit`?**
Considered merging: agent critique first, then human walkthrough. Rejected because the developer does not always want agent critique — sometimes they just want a last look before implementing. Forcing agent review as a prerequisite adds unwanted overhead. The two remain separate tools for separate moments.

**What should the command be called?**
"explain" was rejected (too instructional — it implies the agent explains, not the human reads). "review" was taken. "walk" was proposed but the developer didn't like it. "browse" landed — it implies navigation and reading without judgment, and distinguishes itself from the agent-driven `/tr-audit`.

**Is `/tr-summarize` needed as a companion command?**
Initially scoped in. Dropped: agents are already good at summarizing documents on request. A skill adds value when there is a workflow to follow; "summarize this spec" needs no workflow.

## Alternatives Considered

- **Merge with `/tr-audit`** — rejected; developer doesn't always want agent critique before reading
- **`/tr-explain`** — rejected; implies the agent is explaining, not the developer reading
- **`/tr-walk`** — proposed, rejected by developer preference
- **`/tr-summarize` as separate skill** — scoped in then dropped; redundant with natural agent capability
- **Auto-traversal (descend into children automatically)** — rejected; a behaviour with many implementations would produce an overwhelming wall of text. Explicit new call per level keeps sessions manageable.

## Decision

Single new skill `/tr-browse` — paginated section-by-section reading with [C]/[M] at each step, discussion.md context shown inline, children listed at the end without auto-descent. Stays clearly distinct from `/tr-audit` (agent critique) and `/tr-audit-all` (bulk critique).

## Open Questions
- None. Scope is well-defined.
