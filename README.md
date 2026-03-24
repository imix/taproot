# Taproot

<p align="center">
  <img src="docs/demo.svg" alt="Taproot demo — npx taproot init, /tr-ineed, taproot dod" width="700"/>
</p>

**Your AI coding agent finally knows why.**

AI coding agents generate code fast — but six months later, nobody knows *why* a module exists, who asked for it, or whether it's still needed. The requirement lived in a chat window. The chat window is gone.

Taproot keeps requirements as first-class files in your repo — git-versioned, agent-readable, and validated on every commit.

## Quick Start

```bash
git clone https://github.com/imix/taproot.git
cd taproot && npm install && npm run build && npm link
```

In your project:

```bash
taproot init
```

Taproot will ask which agent adapter to install and whether to set up the pre-commit hook. Then open your agent and run:

```
/tr-guide
```

That's it. The guide walks you through the rest.

## The workflow

Once taproot is set up, your AI agent has the full workflow available as slash commands:

```
/tr-ineed user authentication    ← route any requirement into the hierarchy
                                    (discovery, spec writing, placement)

/tr-implement taproot/auth/login/ ← implement a behaviour: code + tests +
                                    traceability record, committed atomically

/tr-status                        ← health dashboard: coverage, orphans,
                                    stale specs, parked items

/tr-discover                      ← reverse-engineer an existing codebase
                                    into a taproot hierarchy
```

The full list is in [docs/workflows.md](docs/workflows.md).

## Why it matters

- **Ask "why does this code exist?"** and get a structured answer — intent, actor, acceptance criteria — not a two-year-old git blame
- **AI agents generate better code** because they have the business goal alongside the technical context
- **Changes are safer** — trace any file back to its behaviour spec and understand what breaks if you touch it
- **Nothing drifts silently** — `taproot sync-check` flags source files modified after their spec was last reviewed
- **Vague specs are caught at commit time** — DoD/DoR gates block incomplete implementations before they merge

**How requirements are stored:**

```
taproot/
├── password-reset/        ← Intent: why this exists and for whom
│   ├── intent.md
│   └── request-reset/     ← Behaviour: what the system does
│       ├── usecase.md
│       └── email-trigger/ ← Implementation: how it's built
│           └── impl.md
```

Plain Markdown files, no database, git-versioned with your code. Any agent that can read files can use taproot.

## Taproot tracks itself

Taproot's own requirements are managed with Taproot. [`taproot/OVERVIEW.md`](taproot/OVERVIEW.md) shows 18 intents, 53 behaviours, and 53 implementations — all complete — covering everything from validation rules to agent skill architecture to this README.

It's a working example of what a mature hierarchy looks like in practice.

## Docs

- [Workflows](docs/workflows.md) — common patterns: new feature, bug fix, onboarding, discovery
- [Document types & examples](docs/concepts.md)
- [CLI reference](docs/cli.md)
- [Agent setup & tiers](docs/agents.md)
- [Configuration & CI](docs/configuration.md)
- [Patterns](docs/patterns.md)

## License

MIT
