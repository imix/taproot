# Agent Research: Cursor

- **Last updated:** 2026-03-20
- **Version researched:** Cursor 2.0 (2026)

## Isolation mechanism

- **Primary mechanism:** Git worktrees — each parallel agent gets its own filesystem copy of the repo
- **Scope of isolation:** Both filesystem and context window
- **Known limitations:** Changes stay isolated until manually merged; merging N worktrees after a sweep requires developer review

## Sub-agent / parallel execution

- **Supported:** Yes (Cursor 2.0, generally available)
- **How invoked:** UI — open multiple agent panes; or Background Agent mode (remote, async)
- **Max parallelism:** Up to 8 parallel agents (Cursor 2.0)
- **Sub-agents can spawn further sub-agents:** Unknown — research needed
- **Context channel:** UI prompt per agent pane; no programmatic manifest reading documented
- **Result channel:** File edits in worktree; manual review/merge by developer

## Headless / scripting interface

- **CLI flag:** Not documented for scripting use — Cursor is primarily an IDE
- **Stdin/stdout support:** No known headless mode
- **Exit code on failure:** N/A

> Cursor does not appear to have a scripting interface equivalent to `claude -p`. Sweep integration would need to be driven from within the IDE UI, not from a shell script.

## Context limits

> Research needed — assumed comparable to underlying model (Claude/GPT-4 depending on config)

## Token cost model

> Research needed — Cursor uses a subscription model; agent token costs may be abstracted

## Taproot sweep compatibility notes

- **Manifest reading:** No scripting interface — the `/tr-sweep` adapter for Cursor would need to be a Cursor Rule or `.cursorrules` that instructs the agent to read the manifest on startup
- **Per-item execution:** Developer opens N background agent panes, each pointed at a manifest slice; or one agent processes sequentially
- **Result writing:** Agent writes to `sweep-results.json` in its worktree; developer merges
- **Recommended adapter approach:** Cursor Rule that says "on session start, read `.taproot/sweep-manifest.json` if present, process the next unprocessed item, write result, stop." Developer opens one Cursor session per item batch.
- **Key constraint:** No scripting interface means Cursor sweep cannot be fully automated — developer must trigger each agent session manually

## References

- Ameany. "Cursor Background Agents: Complete Guide (2026)." https://ameany.io/blog/cursor-background-agents/ (accessed 2026-03-20)
- Medium. "Parallel AI Agents in Cursor 2.0." https://medium.com/towards-data-engineering/parallel-ai-agents-in-cursor-2-0-a-practical-guide-e808f89cffb9 (accessed 2026-03-20)
- Cursor. "Agents." https://cursor.com/product (accessed 2026-03-20)
