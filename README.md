# Taproot

*Requirements as the root system of your codebase.*

Every piece of code traces back to a business intent. Every intent traces forward to working, tested code.

```
taproot/
├── password-reset/          ← Intent: why this exists
│   ├── intent.md
│   └── request-reset/       ← Behaviour: what it does
│       ├── usecase.md
│       └── email-trigger/   ← Implementation: how it's built
│           └── impl.md
```

Stored as plain markdown alongside your code. Git-versioned. No database.

## Quick Start

```bash
npm install -g taproot
taproot init --with-skills --agent claude
```

Then in your agent:

```
/tr-guide              ← onboarding walkthrough
/tr-ineed <idea>       ← route any requirement into the hierarchy
/tr-discover           ← reverse-engineer an existing codebase into taproot
/tr-status             ← health dashboard: coverage, orphans, stale specs
```

## Why

AI-assisted coding generates code fast but loses track of *why* the code exists. Six months later, nobody knows what a module was meant to do, who asked for it, or whether it's still needed.

Taproot solves this by keeping requirements as first-class files in your repo. When requirements live alongside the code:

- **You can ask "why does this code exist?"** and get a structured answer — an intent with stakeholders and success criteria, not a git blame from two years ago
- **AI agents can generate better code** because they have the business context, not just the technical context
- **Changes are safer** — before editing a module, you can trace it to its behaviour spec and understand the intended postconditions
- **Nothing gets lost** — validated by CLI on every commit, updated by AI skills as understanding evolves

Taproot is designed to work with how teams actually develop: requirements emerge, implementations diverge, specs go stale. The workflow accounts for that instead of pretending it doesn't happen.

- **Filesystem is the data model** — no external tool, no database, git-versioned with your code
- **CLI validates structure and format** — agent skills create content and trace relationships
- **Agent-agnostic** — works with Claude Code, Cursor, Copilot, Windsurf, or any file-reading assistant

## Taproot tracks itself

Taproot's own requirements are managed with Taproot. The [`taproot/OVERVIEW.md`](taproot/OVERVIEW.md) shows 12 intents, 24 behaviours, and 24 implementations — all complete — covering everything from validation rules to agent skill design. It's a working example of what a hierarchy looks like in practice.

## Docs

- [Document types & examples](docs/concepts.md)
- [CLI reference](docs/cli.md)
- [Agent setup & skills](docs/agents.md)
- [Workflows](docs/workflows.md)
- [Configuration & CI](docs/configuration.md)

## License

MIT
