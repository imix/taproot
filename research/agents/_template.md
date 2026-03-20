# Agent Research: <Agent Name>

> Template for documenting AI coding agent capabilities relevant to taproot integration.
> Copy this file, fill in known sections, mark unknowns as `> Research needed`.

- **Last updated:** YYYY-MM-DD
- **Version researched:** vX.Y or "as of YYYY-MM"

## Isolation mechanism

How does this agent isolate work between independent tasks?

- Primary mechanism: (git worktree / fresh process / sub-agent context / none)
- Scope of isolation: (filesystem / context window / both / neither)
- Known limitations:

> Research needed

## Sub-agent / parallel execution

Can this agent spawn isolated sub-agents or run tasks in parallel?

- Supported: yes / no / experimental
- How invoked: (tool call / API / CLI flag / UI)
- Max parallelism:
- Sub-agents can spawn further sub-agents: yes / no
- Context channel (parent → sub-agent): (prompt string only / shared memory / file)
- Result channel (sub-agent → parent): (final message only / full history / file)

> Research needed

## Headless / scripting interface

Can this agent be invoked non-interactively from a shell or script?

- CLI flag: (e.g. `-p`, `--print`, `--headless`)
- Example: `agent-cli -p "task" < item-content.txt`
- Stdin/stdout support: yes / no
- Exit code on failure: yes / no

> Research needed

## Context limits

- Context window size:
- Practical usable context (after system prompt overhead):
- Behaviour at limit: (truncation / error / compression)

> Research needed

## Token cost model

- Pricing tier relevant to sub-agent use:
- Multiplier vs single-agent session: (e.g. ~15x for Claude Agent Teams)
- Cost controls available: (dry-run / token budget / rate limits)

> Research needed

## Taproot sweep compatibility notes

How would `taproot sweep` integrate with this agent's isolation mechanism?

- Manifest reading: how the `/tr-sweep` adapter for this agent reads the manifest
- Per-item execution: which isolation mechanism is used
- Result writing: how results are written back to `sweep-results.json`
- Recommended adapter approach:

> Research needed

## References

- (title, URL, accessed date)
