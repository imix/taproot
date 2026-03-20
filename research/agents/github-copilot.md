# Agent Research: GitHub Copilot

- **Last updated:** 2026-03-20
- **Version researched:** Copilot CLI GA (Feb 2026); Coding Agent cloud mode

## Isolation mechanism

- **Primary mechanism:** Git worktrees for background/cloud agents; fresh context window for sub-agents
- **Scope of isolation:** Both filesystem (worktree) and context window (sub-agents)
- **Known limitations:** Cloud Coding Agent runs on GitHub Actions runners — requires GitHub Actions access

## Sub-agent / parallel execution

- **Supported:** Yes — four distinct agent types:
  1. **Local Agent** — interactive, in VS Code
  2. **Background Agent (CLI)** — local, async, `&` prefix to delegate
  3. **Cloud Coding Agent** — runs on GitHub Actions runners, PR-based workflow
  4. **Sub-agents** — isolated subtasks within a parent session; return summary only
- **How invoked:** `&` prefix in CLI for background; sub-agent API for sub-tasks; PR assignment for cloud agent
- **Max parallelism:** Multiple background sessions supported; cloud agent parallelism tied to Actions concurrency
- **Sub-agents can spawn further sub-agents:** Unknown — research needed
- **Context channel (parent → sub-agent):** Prompt string
- **Result channel (sub-agent → parent):** Final summary only — intermediate work discarded

## Headless / scripting interface

- **CLI flag:** `gh copilot` CLI; background mode with `&` prefix
- **Example:** `gh copilot suggest "$(cat task.txt)" &`
- **Stdin/stdout support:** Partial — CLI available but not fully documented for scripting
- **Exit code on failure:** Yes (CLI)

## Context limits

> Research needed

## Token cost model

> Research needed — included in Copilot subscription; cloud agent may have separate billing

## Taproot sweep compatibility notes

- **Manifest reading:** `/tr-sweep` adapter for Copilot could use background agents — one `&`-prefixed session per manifest item
- **Per-item execution:** Background agent with git worktree isolation per item
- **Result writing:** Agent writes to `sweep-results.json` in its worktree; merged after sweep
- **Recommended adapter approach:** Shell script loops over manifest, spawns `gh copilot` background session per item; or Copilot Rule triggers sweep on session start
- **Key advantage over Claude Code:** Git worktree isolation prevents file conflicts in parallel runs

## References

- GitHub. "About GitHub Copilot coding agent." https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent (accessed 2026-03-20)
- VS Code. "Copilot CLI sessions — background agents." https://code.visualstudio.com/docs/copilot/agents/background-agents (accessed 2026-03-20)
- GitHub Changelog. "GitHub Copilot CLI is now generally available." https://github.blog/changelog/2026-02-25-github-copilot-cli-is-now-generally-available/ (accessed 2026-03-20)
- CloudDev. "The Four Types of GitHub Copilot Agents." https://clouddev.blog/GitHub/Copilot/the-four-types-of-github-copilot-agents-local-background-cloud-and-sub-agents-explained/ (accessed 2026-03-20)
