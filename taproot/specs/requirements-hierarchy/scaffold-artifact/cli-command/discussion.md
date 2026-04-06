# Discussion: CLI Command — taproot new

## Session
- **Date:** 2026-04-06
- **Skill:** tr-implement

## Pivotal Questions

**How to handle the variable number of positional args across types?**
`intent` takes one arg (`slug`); `behaviour` and `impl` take two (`parent`, `slug`). Options were: (a) three separate subcommands (`taproot new-intent`, `taproot new-behaviour`, `taproot new-impl`), (b) a single command with variadic `[args...]` and type-based resolution, or (c) a wizard-only flow with no positional args. Option (b) was chosen — it keeps the CLI surface minimal, is consistent with how other CLIs (e.g. `rails generate`) handle polymorphic commands, and makes non-interactive agent use straightforward (`taproot new behaviour <parent> <slug>` with all args supplied).

**Should `behaviour` accept both intent and behaviour parents for sub-behaviours?**
The spec requires sub-behaviour scaffolding (AC-4). Rather than adding a separate `sub-behaviour` type, detecting `usecase.md` at the parent directory handles this transparently — matching how the hierarchy actually works (behaviours nest under behaviours).

## Alternatives Considered
- **Three separate subcommands** (`taproot new-intent`, `taproot new-behaviour`, `taproot new-impl`) — rejected because it fragments the CLI surface and makes tab-completion noisy. The type arg is cleaner.
- **Wizard-only (no positional args)** — rejected because agent use cases need non-interactive scripted invocation; always prompting would require stdin mocking.
- **`@inquirer/input` dependency** — adding it is lightweight (already using the `@inquirer/` family for `checkbox`, `confirm`, `select`) and avoids implementing a readline wrapper.

## Decision
Single `taproot new <type> [args...]` command with a programmatic `runNew()` export. Type-based resolution of positional args. Interactive prompts via `@inquirer/input` only when args are missing. Sub-behaviour detection is implicit via `usecase.md` presence at the parent.

## Open Questions
- None — AC-5 (interactive prompting for missing args) is covered in the CLI action handler but not tested at integration level (would require stdin mocking); the non-interactive path is fully covered.
