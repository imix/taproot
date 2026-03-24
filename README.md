# Taproot

<p align="center">
  <img src="docs/demo.svg" alt="Taproot demo — npx taproot init, /tr-ineed, taproot dod" width="700"/>
</p>

**Your AI coding agent finally knows why.**

AI coding agents generate code fast — but six months later, nobody knows *why* a module exists, who asked for it, or whether it's still needed. The requirement lived in a chat window. The chat window is gone.

Taproot keeps requirements as first-class files in your repo — git-versioned, agent-readable, and validated on every commit. Your agent stops guessing at intent and starts working from a living spec.

```
taproot/
├── password-reset/        ← Intent: why this exists and for whom
│   ├── intent.md
│   └── request-reset/     ← Behaviour: what the system does
│       ├── usecase.md
│       └── email-trigger/ ← Implementation: how it's built
│           └── impl.md
```

## Why it matters

- **Ask "why does this code exist?"** and get a structured answer — intent, actor, acceptance criteria — not a two-year-old git blame
- **AI agents generate better code** because they have the business goal alongside the technical context
- **Changes are safer** — trace any file back to its behaviour spec and understand what breaks if you touch it
- **Nothing drifts silently** — `taproot sync-check` flags source files modified after their spec was last reviewed
- **Vague specs are caught at commit time** — DoD/DoR gates block incomplete implementations before they merge

## Design principles

- **Filesystem is the data model** — no database, no external service, plain Markdown alongside your code
- **Requirements trace in both directions** — from business intent down to source files, and from code back up to the goal
- **Agent-agnostic** — works with Claude Code, Cursor, Copilot, Windsurf, or any file-reading assistant

## Quick Start

```bash
git clone https://github.com/imix/taproot.git
cd taproot && npm install && npm run build && npm link
```

Then in your project:

```bash
taproot init --agent claude --with-hooks
```

| Agent | Support |
|-------|---------|
| `claude` | Tier 1 — fully supported |
| `gemini` | Tier 2 — implemented & tested |
| `cursor` `copilot` `windsurf` | Tier 3 — community supported |

Then in your agent:

```
/tr-guide              ← onboarding walkthrough
/tr-ineed <idea>       ← route any requirement into the hierarchy
/tr-status             ← health dashboard: coverage, orphans, stale specs
/tr-discover           ← reverse-engineer an existing project into taproot
```

## Taproot tracks itself

Taproot's own requirements are managed with Taproot. [`taproot/OVERVIEW.md`](taproot/OVERVIEW.md) shows 18 intents, 53 behaviours, and 53 implementations — all complete — covering everything from validation rules to agent skill architecture to this README.

It's a working example of what a mature hierarchy looks like in practice.

## Docs

- [Document types & examples](docs/concepts.md)
- [CLI reference](docs/cli.md)
- [Agent setup & tiers](docs/agents.md)
- [Workflows](docs/workflows.md)
- [Configuration & CI](docs/configuration.md)
- [Patterns](docs/patterns.md)

## License

MIT
