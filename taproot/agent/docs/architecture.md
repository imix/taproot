# Architecture

Architectural decisions, constraints, and patterns for the taproot codebase. Every implementation must be checked against these before coding begins (enforced via `definitionOfReady`).

---

## Principles

**Filesystem as data model** — No external database or service. All hierarchy state lives in git-versioned markdown files under `taproot/`. No runtime state is persisted outside the filesystem.

**Immutable config after load** — `loadConfig()` is called once at command entry; the resolved config object is passed down. Commands never re-read the config file mid-execution.

**External I/O only at command boundaries** — File reads/writes, git invocations, and process spawns happen in command handlers (`src/commands/`), not in core logic (`src/core/`). Core modules receive data, not file paths, wherever practical.

**Stateless CLI commands** — Each CLI invocation is independent. No daemon, no persistent process, no shared mutable state between invocations.

**Agent-agnostic output** — Skill files and adapter files must be plain markdown/text. No agent-specific syntax in the hierarchy documents themselves.

---

## Constraints

**No global mutable state** — No module-level variables that accumulate state across calls. Functions that need shared state receive it as parameters.

**Unified `taproot/` directory layout** — All taproot content lives under `taproot/`: requirement documents in `taproot/specs/` (or directly under `taproot/` with a custom `root:` setting), agent skills and docs in `taproot/agent/`, and global truths in `taproot/global-truths/`. Settings live at `taproot/settings.yaml`. The `.taproot/` directory is reserved for gitignored runtime scratch only (session state, test result cache, truth-check sessions).

**`.taproot/` is runtime scratch, not content** — Files written by CLI invocations that should not be committed (session state, `.truth-check-session`, `.test-results/`) go in `.taproot/`. Add `.taproot/` to `.gitignore`. Never place spec documents, skill files, or configuration there.

**Markdown is the schema** — All hierarchy documents (intent.md, usecase.md, impl.md) must be valid CommonMark. No proprietary extensions.

**Error messages must be actionable** — Every error surface (CLI output, DoD/DoR failures, validate-format output) must include a correction hint, not just a description of what failed.

**No raw exceptions to the user** — The CLI top-level handler catches all thrown errors and prints only the message, never a stack trace or Node.js exception dump. `process.exitCode = 1` is set; the process exits cleanly. Stack traces are for tests and debugging only.

---

## Module boundaries

| Layer | Path | Responsibility |
|---|---|---|
| Commands | `src/commands/` | CLI registration, I/O, orchestration |
| Core | `src/core/` | Pure logic: parsing, validation, config, runners |
| Validators | `src/validators/` | Types and structural validation rules |
| Adapters | `src/adapters/` | Agent-specific adapter/skill generation |
| Templates | `src/templates/` | Document scaffolding strings |

Core modules must not import from commands. Commands may import from core, validators, adapters, and templates.

---

## Testing

Integration tests use real temporary directories (`mkdtempSync`) — no mocking the filesystem. Config in tests must be written to `taproot/settings.yaml` (matching the layout that `taproot init` now creates).
