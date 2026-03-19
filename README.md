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
/tr-guide          ← onboarding walkthrough
/tr-ineed <idea>   ← route a requirement into the hierarchy
/tr-status         ← health dashboard
```

## Why

AI-assisted coding generates code fast but loses track of *why* the code exists. Taproot keeps requirements synchronized with the codebase — validated by CLI, navigated by AI skills.

- **Filesystem is the data model** — no external tool, git-versioned with your code
- **CLI validates structure and format** — agent skills create content and trace relationships
- **Agent-agnostic** — works with Claude Code, Cursor, Copilot, Windsurf, or any file-reading assistant

## Docs

- [Document types & examples](docs/concepts.md)
- [CLI reference](docs/cli.md)
- [Agent setup & skills](docs/agents.md)
- [Workflows](docs/workflows.md)
- [Configuration & CI](docs/configuration.md)

## License

MIT
