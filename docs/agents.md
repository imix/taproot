# Agent Setup

Run `taproot init --agent <name>` to generate the adapter for your AI assistant:

| Agent | Command | Output |
|-------|---------|--------|
| Claude Code | `taproot init --agent claude` | `.claude/commands/tr-*.md` |
| Cursor | `taproot init --agent cursor` | `.cursor/rules/taproot.md` |
| GitHub Copilot | `taproot init --agent copilot` | `.github/copilot-instructions.md` |
| Windsurf | `taproot init --agent windsurf` | `.windsurfrules` |
| Any agent | `taproot init --agent generic` | `AGENTS.md` |
| All agents | `taproot init --agent all` | All of the above |

## Skills (Claude Code)

After `taproot init --agent claude`, skills are available as slash commands:

| Command | Purpose |
|---------|---------|
| `/tr-guide` | Onboarding walkthrough |
| `/tr-ineed` | Route a natural language requirement to the right place |
| `/tr-brainstorm` | Explore an idea before committing to an intent |
| `/tr-intent` | Create or refine a business intent |
| `/tr-behaviour` | Define a UseCase under an intent |
| `/tr-decompose` | Break an intent into behaviours |
| `/tr-implement` | Implement a behaviour with full traceability |
| `/tr-trace` | Navigate: file → impl → behaviour → intent (and back) |
| `/tr-status` | Coverage dashboard with actionable suggestions |
| `/tr-review` | Stress-test any artifact |
| `/tr-review-all` | Comprehensive review of a subtree |
| `/tr-refine` | Update a spec from implementation learnings |
| `/tr-promote` | Escalate a finding to the intent level |

Skills are portable markdown files in `taproot/skills/` — not IDE plugins. They work with any agent that reads files.
