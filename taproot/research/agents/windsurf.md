# Agent Research: Windsurf (formerly Codeium)

- **Last updated:** 2026-03-20
- **Version researched:** Wave 13 (Feb 2026); acquired by Cognition AI Dec 2025

## Isolation mechanism

- **Primary mechanism:** Git worktrees — same as Cursor; parallel Cascade agents each get an isolated workspace
- **Scope of isolation:** Both filesystem and context window
- **Known limitations:** Same merge overhead as Cursor; 5-agent limit

## Sub-agent / parallel execution

- **Supported:** Yes (Wave 13, Feb 2026)
- **How invoked:** UI — side-by-side Cascade panes
- **Max parallelism:** 5 parallel Cascade agents
- **Sub-agents can spawn further sub-agents:** Unknown — research needed
- **Context channel:** UI prompt per Cascade pane
- **Result channel:** File edits in worktree; developer merges

## Headless / scripting interface

> Research needed — Windsurf is primarily an IDE; no documented headless/scripting mode found

## Context limits

> Research needed

## Token cost model

> Research needed — subscription model; token costs may be abstracted

## Taproot sweep compatibility notes

- **Recommended adapter approach:** Similar to Cursor — a Windsurf Rule that triggers sweep processing on session start when a manifest is present
- **Key constraint:** No scripting interface; 5-agent parallelism cap

## References

- Windsurf. "Windsurf Next Changelogs." https://windsurf.com/changelog/windsurf-next (accessed 2026-03-20)
- Codecademy. "Agentic IDE Comparison: Cursor vs Windsurf vs Antigravity." https://www.codecademy.com/article/agentic-ide-comparison-cursor-vs-windsurf-vs-antigravity (accessed 2026-03-20)
