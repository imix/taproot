# Research: Agent Sweep Isolation Mechanisms

- **Topic:** How AI coding agent platforms support isolated sub-agent execution per item
- **Purpose:** Inform design of `taproot sweep` — a platform-agnostic hierarchy sweep command
- **Last updated:** 2026-03-20

## Key conclusions

1. **Git worktrees are the convergent isolation primitive for IDEs.** Cursor, Windsurf, and Copilot all use git worktrees for parallel agent isolation. Filesystem changes stay isolated until merged.

2. **Headless CLI (`-p` flag) is the lowest-common-denominator.** Claude Code, Gemini CLI, and Copilot CLI all support a non-interactive mode. This is the universal scripting interface.

3. **Sub-agent spawning is platform-specific in mechanism, equivalent in contract.** All platforms share the contract: `fresh context + task prompt → result only`. The parent never sees intermediate steps.

4. **No platform supports recursive sub-agents.** One level of isolation only across all platforms.

5. **The manifest/results file pattern maps cleanly to every platform.** See per-agent files for specifics.

6. **Token cost is significant.** ~4–7x for multi-agent; ~15x for Agent Teams. Scope guard and `--dry-run` are important cost controls.

7. **The shell scripting approach is the universal fallback.** Any agent with a `-p` CLI flag works with a simple shell loop.

## Platform compatibility matrix

| Platform | Isolation | Scripting | Parallel | Sweep approach |
|---|---|---|---|---|
| Claude Code | Context window | `claude -p` ✓ | Agent tool (sequential safer) | Skill loops manifest, Agent tool per item |
| Cursor | Git worktree | ✗ | 8 agents | Cursor Rule reads manifest on session start |
| Windsurf | Git worktree | ✗ | 5 agents | Windsurf Rule reads manifest on session start |
| GitHub Copilot | Worktree + context | `gh copilot &` partial | Multiple background | Shell loop or background sessions |
| Gemini CLI | Context window | `gemini -p` ✓ | Experimental subagents | Shell loop or subagent tool |
| Shell/CI | Process | any `-p` CLI ✓ | `xargs -P` | Universal shell loop |

## Per-agent detail files

- `research/agents/claude-code.md`
- `research/agents/cursor.md`
- `research/agents/windsurf.md`
- `research/agents/github-copilot.md`
- `research/agents/gemini-cli.md`
- `research/agents/generic-shell.md`
- `research/agents/_template.md` — template for adding new agents

## Open questions

- Should items in the manifest include full file content or just paths?
- Should `taproot sweep` support parallel execution natively or leave parallelism to the adapter?
- At what hierarchy size does a sweep become impractical given token costs?

## References

See per-agent files for full citations.
