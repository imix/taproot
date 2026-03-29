# Agent Research: Claude Code

- **Last updated:** 2026-03-20
- **Version researched:** as of 2026-03 (Agent Teams, Feb 2026)

## Isolation mechanism

- **Primary mechanism:** Fresh context window per sub-agent invocation via the `Agent` tool
- **Scope of isolation:** Context window only — sub-agent shares the same filesystem as the parent; no git worktree isolation
- **Known limitations:** Sub-agent can read/write files in the shared workspace; concurrent sub-agents may conflict on the same files without external locking

## Sub-agent / parallel execution

- **Supported:** Yes (Agent tool, generally available)
- **How invoked:** `Agent` tool call from within a skill or parent agent session
- **Max parallelism:** Multiple sub-agents can be launched in a single message; Agent Teams (Feb 2026) support multi-session parallel runs at ~15x token cost
- **Sub-agents can spawn further sub-agents:** No — one level deep only
- **Context channel (parent → sub-agent):** Prompt string only — the only data the sub-agent receives is what is embedded in the Agent tool's `prompt` parameter; no shared memory or variables
- **Result channel (sub-agent → parent):** Final message only — all intermediate tool calls and file reads stay inside the sub-agent's context and are discarded

## Headless / scripting interface

- **CLI flag:** `claude -p "<prompt>"` or `claude --print`
- **Example:** `claude -p "$(cat task.txt)\n\n$(cat item.md)" > result.txt`
- **Stdin/stdout support:** Yes
- **Exit code on failure:** Yes (non-zero on error)

## Context limits

- **Context window size:** 200K tokens per sub-agent
- **Practical usable context:** ~180K after system prompt and tool definitions
- **Behaviour at limit:** Truncation with warning; long files may need chunking

## Token cost model

- **Pricing tier:** Standard API pricing per token
- **Multiplier vs single-agent session:** ~4–7x for standard multi-agent; ~15x for Agent Teams (experimental multi-session)
- **Cost controls available:** No built-in token budget per sweep; `--dry-run` in taproot sweep is the main cost control

## Taproot sweep compatibility notes

- **Manifest reading:** `/tr-sweep` skill reads `sweep-manifest.json`, iterates items
- **Per-item execution:** Uses `Agent` tool — each item spawned as a fresh sub-agent with `task + item content` as the prompt
- **Result writing:** Sub-agent writes result entry to `sweep-results.json` as a tool call; or returns structured result that parent writes
- **Recommended adapter approach:** Skill loops over manifest entries, spawns one `Agent` tool call per item sequentially (parallelism optional — risk of file conflicts without worktree isolation)
- **Key constraint:** No git worktree isolation — concurrent sub-agents writing the same file will conflict. Sequential execution is safer for file-editing sweeps.

## References

- Anthropic. "Create custom subagents." https://code.claude.com/docs/en/sub-agents (accessed 2026-03-20)
- Anthropic. "Subagents in the SDK." https://platform.claude.com/docs/en/agent-sdk/subagents (accessed 2026-03-20)
- Claudefa.st. "Claude Code Async: Background Agents & Parallel Tasks." https://claudefa.st/blog/guide/agents/async-workflows (accessed 2026-03-20)
