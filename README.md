# Taproot

AI coding agents generate code fast — but six months later, nobody knows *why* a module exists, who asked for it, or whether it's still needed.

**Taproot keeps requirements as first-class files in your repo.** Business intents, behaviour specs, and implementation records live as plain Markdown alongside the code they describe — git-versioned, agent-readable, and validated on every commit.

```
taproot/
├── password-reset/       ← Intent: why this exists and for whom
│   ├── intent.md
│   └── request-reset/    ← Behaviour: what the system does
│       ├── usecase.md
│       └── email-trigger/  ← Implementation: how it's built
│           └── impl.md
```

## Design principles

- **Filesystem is the data model** — no database, no external service, git-versioned with your code
- **Requirements trace in both directions** — from business intent down to source files, and from code back up to the business goal
- **Agent-agnostic** — works with Claude Code, Cursor, Copilot, Windsurf, or any file-reading assistant

## Quick Start

Taproot is not yet published to npm. Install directly:

```bash
git clone https://github.com/imix/taproot.git
cd taproot
npm install && npm run build && npm link
```

Then in your project:

```bash
taproot init --agent <agent> --with-hooks
```

| Agent | Tier |
|-------|------|
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

## Why

**AI-assisted coding loses context.** Code gets generated without a traceable link to the requirement it satisfies. Six months later: no spec, no stakeholder, no idea whether it's safe to change.

Taproot solves this by making requirements structural:

- **Ask "why does this code exist?"** and get a structured answer — intent, stakeholders, success criteria — not a two-year-old git blame
- **AI agents generate better code** because they have business context alongside the technical context
- **Changes are safer** — trace any file to its behaviour spec; understand the postconditions before editing
- **Vague specs are caught early** — acceptance criteria enforced at commit time; DoD/DoR gates block incomplete work before it merges
- **Nothing drifts silently** — `taproot sync-check` flags source files modified after their spec was last reviewed

## Taproot tracks itself

Taproot's own requirements are managed with Taproot. [`taproot/OVERVIEW.md`](taproot/OVERVIEW.md) shows 16 intents, 46 behaviours, and 46 implementations — all complete — covering everything from validation rules to agent skill architecture to this README.

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
