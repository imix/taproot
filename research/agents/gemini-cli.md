# Agent Research: Gemini CLI

- **Last updated:** 2026-03-20
- **Version researched:** as of 2026-03 (subagents experimental)

## Isolation mechanism

- **Primary mechanism:** Fresh process per headless invocation; experimental subagents have isolated context loops
- **Scope of isolation:** Context window (subagents); filesystem is shared unless caller manages worktrees
- **Known limitations:** Subagents are experimental; filesystem isolation must be handled externally

## Sub-agent / parallel execution

- **Supported:** Experimental (`subagents` feature)
- **How invoked:** Subagent tool call within a Gemini CLI session; or headless `-p` per item
- **Max parallelism:** Not documented — assumed limited; recursion protection built in
- **Sub-agents can spawn further sub-agents:** No — recursion protection prevents it
- **Context channel (parent → sub-agent):** Prompt string + explicitly granted tools only
- **Result channel (sub-agent → parent):** Final message only; intermediate history discarded

## Headless / scripting interface

- **CLI flag:** `gemini -p "<prompt>"` or `gemini --print`
- **Example:** `gemini -p "$(cat task.txt)\n\n$(cat item.md)" > result.txt`
- **Stdin/stdout support:** Yes — headless mode documented for batch processing
- **Exit code on failure:** Yes
- **Note:** Headless mode is fully documented and production-ready; subagents are experimental

## Context limits

> Research needed — Gemini 2.0 Flash has 1M token context; practical sub-agent limit unknown

## Token cost model

> Research needed — Google AI pricing; free tier available for CLI

## Taproot sweep compatibility notes

- **Manifest reading:** `/tr-sweep` adapter reads manifest, uses subagent tool per item (experimental) OR falls back to shell loop with `gemini -p` per item
- **Per-item execution:** Headless mode is the reliable path; subagents are experimental bonus
- **Result writing:** Agent writes to `sweep-results.json`; headless mode pipes stdout to result file
- **Recommended adapter approach:** Shell script using `gemini -p` per item — most reliable, no experimental features required
- **Key advantage:** Best headless/scripting story of the IDE-adjacent agents; `-p` mode is production-ready

## References

- Gemini CLI. "Subagents (experimental)." https://geminicli.com/docs/core/subagents/ (accessed 2026-03-20)
- Gemini CLI. "Automate tasks with headless mode." https://geminicli.com/docs/cli/tutorials/automation/ (accessed 2026-03-20)
- Google. "gemini-cli GitHub." https://github.com/google-gemini/gemini-cli (accessed 2026-03-20)
- Medium. "Advanced Gemini CLI: Part 3 — Dynamic Isolated Agents." https://medium.com/google-cloud/advanced-gemini-cli-part-3-isolated-agents-b9dbab70eeff (accessed 2026-03-20)
