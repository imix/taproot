# Discussion: Manage Backlog

## Session
- **Date:** 2026-03-25
- **Skill:** tr-behaviour

## Pivotal Questions

**Single command or two commands (capture vs triage)?**
One command — `/tr-backlog <idea>` to capture, `/tr-backlog` with no args to triage. Simpler to learn, natural to use. The presence of an argument is a clean disambiguation signal.

**Where is the backlog stored?**
`.taproot/backlog.md` — inside the taproot config directory. Not the hierarchy (backlog items aren't hierarchy artefacts yet), not a root-level file (avoids `findings.md` scattered-file anti-pattern). Committed to git, so items survive across machines.

**Should capture auto-promote to /tr-ineed?**
No. The whole point is speed — capture now, decide later. Auto-promotion would require the same upfront thinking the backlog is designed to defer.

**Should there be priority, labels, or status tracking?**
Explicitly out of scope. A backlog with priority is a project management tool; this is a scratchpad.

## Alternatives Considered

- **Two separate commands `/tr-capture` and `/tr-triage`** — rejected. One command per concept is cleaner; the arg/no-arg split is obvious and familiar (e.g. `git stash` / `git stash pop`).
- **CLI command only (`taproot backlog "idea"`)** — noted as a natural extension but out of scope. The primary use case is mid-agent-session capture.
- **Root-level `BACKLOG.md`** — rejected in favour of `.taproot/backlog.md`. Keeps the project root clean; taproot-managed files live in taproot directories.

## Decision

Single `/tr-backlog` skill with two modes distinguished by the presence of an argument. Storage in `.taproot/backlog.md`. Items are date-prefixed markdown list items. Triage offers [D]/[K]/[P] per item; [P] delegates to `/tr-ineed`.

## Open Questions
- Should items capture context beyond the one-liner (e.g. which file was open, which behaviour was being implemented)? Deferred — keep capture simple for now.
