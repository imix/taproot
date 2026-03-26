# Research: Parallel Agent Execution

**Topic:** Coordinating multiple AI coding agents writing shared files safely in the same repository — isolation models, locking mechanisms, and merge strategies for taproot's parallel execution behaviour.

**Researched:** 2026-03-26

---

## Local sources
- `research/agents/claude-code.md` — Claude Code sub-agent model (shared filesystem, no worktree isolation by default); sequential safer for shared file writes; `-w` flag creates worktrees per agent
- `research/agents/cursor.md` — Cursor uses git worktrees (each agent gets isolated working directory); conflicts surface at merge, not during execution

## Web sources
- **Better Stack — Git Worktrees with Claude Code** (https://betterstack.com/community/guides/ai/git-worktrees-claude/) — `claude -w <name>` creates a dedicated worktree + branch per agent; `isolation: "worktree"` in agent config automates this; each agent works in full filesystem isolation during execution; merge via standard git PRs; same-name invocations resume existing worktree
- **Martin Kleppmann — How to do distributed locking** (https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html) — canonical reference; TTL-based advisory locks have a fundamental race condition (paused process resumes after TTL expiry and acts as if it holds the lock); recommends fencing tokens to detect stale writes; relevant mainly for the shared-filesystem model
- **Upsun — Git worktrees for parallel AI coding agents** (https://devcenter.upsun.com/posts/git-worktrees-for-parallel-ai-coding-agents/) — each agent gets isolated working directory checked out from the same `.git`; sequential merge strategy (rebase each branch on top of the previous merge) avoids most conflicts; disk cost ~5x codebase size at peak
- **Qt Documentation — QLockFile Class** (https://doc.qt.io/qt-6/qlockfile.html) — production advisory lock file format: PID + hostname + app name + mtime threshold; staleness = stored PID not running + age > threshold; falls back to age-based removal if PID check is inconclusive
- **Claude Code sub-agent best practices** (https://claudefa.st/blog/guide/agents/sub-agent-best-practices) — safe parallel dispatch preconditions: 3+ unrelated tasks, no shared state, non-overlapping file paths; "file ownership by directory" pattern; shared contracts written sequentially first
- **Running Multiple AI Coding Agents in Parallel** (https://zenvanriel.com/ai-engineer-blog/running-multiple-ai-coding-agents-parallel/) — optimistic vs pessimistic locking; pessimistic (advisory lockfiles) suits cooperative agents; optimistic suits high-contention scenarios

## Key conclusions

1. **Two isolation models exist, not one.** The taproot spec was written for the *shared-filesystem* model (Claude Code sub-agents without worktrees), but Claude Code `-w`, Cursor, Codex, and Cursor Background Agent all use the *worktree* model. **The worktree model is increasingly the default for production parallel work.**

2. **In the worktree model, in-flight file conflicts don't exist.** Each agent writes to its own directory copy. The concern shifts entirely to the *merge phase*: what happens when N branches each add entries to `OVERVIEW.md` or `intent.md ## Behaviours`?

3. **OVERVIEW.md and CONTEXT.md are derived artifacts — they should be regenerated post-merge, not merged.** `taproot overview` and `taproot coverage --format context` each take 1–2 seconds. Running them once after all branches are merged is simpler and safer than attempting a 3-way merge of a generated file. Marking these files in `.gitattributes` with `merge=ours` (or `merge=union`) could also suppress false conflicts.

4. **intent.md `## Behaviours` link sections auto-merge cleanly in practice.** Each parallel agent adds a different `- [Behaviour](./path/usecase.md)` line to a different place in the list. Git appends both as new additions with no conflict as long as agents are not modifying the same existing list entry.

5. **Advisory locks (shared-filesystem model) are still needed** for teams using Claude Code sub-agents without `-w`, or for agents that don't support worktree isolation. Lock file format: `{agentId, pid, hostname, timestamp, ttl, file}` in `.taproot/locks/<safe-filename>.lock`. Stale detection: stored PID not running OR age > TTL.

6. **The spec's "Unresolvable rebase conflict" error condition should carve out generated files.** `OVERVIEW.md` and `CONTEXT.md` are always resolvable by regeneration — `taproot overview && taproot coverage --format context` produces the correct merged state without manual conflict resolution.

7. **Kleppmann's fencing-token concern is relevant but bounded** for taproot's use case. The shared files are markdown, the stakes are low, and TTL is in seconds. A simple advisory lockfile is adequate; fencing tokens would add complexity for negligible benefit.

## Open questions
- Should taproot expose `taproot lock acquire/release <file>` as a CLI command (for skills to call), or should locking be internal to `taproot overview` and similar commands?
- Should the usecase.md spec explicitly describe the worktree model as an alternate flow, or treat it as an implementation detail that falls outside taproot's scope (handled by the agent platform)?
- Is there a `.gitattributes` merge strategy for OVERVIEW.md that would eliminate conflicts entirely in the worktree model?

## References
- Anthropic / Better Stack. "Git Worktrees with Claude Code." https://betterstack.com/community/guides/ai/git-worktrees-claude/ (accessed 2026-03-26)
- Kleppmann, M. "How to do distributed locking." 2016. https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html (accessed 2026-03-26)
- "Git worktrees for parallel AI coding agents." Upsun Developer Center. https://devcenter.upsun.com/posts/git-worktrees-for-parallel-ai-coding-agents/ (accessed 2026-03-26)
- Qt Group. "QLockFile Class | Qt Core | Qt 6.11.0." https://doc.qt.io/qt-6/qlockfile.html (accessed 2026-03-26)
- "Claude Code Sub-Agents: Parallel vs Sequential Patterns." claudefa.st. https://claudefa.st/blog/guide/agents/sub-agent-best-practices (accessed 2026-03-26)
- "Running Multiple AI Coding Agents in Parallel." Zen van Riel. https://zenvanriel.com/ai-engineer-blog/running-multiple-ai-coding-agents-parallel/ (accessed 2026-03-26)
