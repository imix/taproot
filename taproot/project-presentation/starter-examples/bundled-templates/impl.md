# Implementation: Bundled Templates

## Behaviour
../usecase.md

## Design Decisions
- Templates are bundled in `examples/` at the package root (same pattern as `skills/` and `docs/`), resolved via `BUNDLED_EXAMPLES_DIR` pointing two levels up from `src/commands/`.
- The `--template` flag skips the interactive prompt entirely for scripted/CI use (AC-6 alternate flow).
- The interactive prompt only appears when `taproot/` does not yet exist — avoids pestering users who re-run `taproot init` to add a new agent adapter.
- `applyTemplate()` is exported separately from `runInit()` so tests can cover template application in isolation without needing a full git repo + config flow.
- `--force` only applies to `.taproot/settings.yaml` overwrite (the hierarchy copy is always unconditional since it targets `taproot/`, which by definition doesn't exist when the prompt fires).
- `@inquirer/select` added as a dependency (consistent with existing `@inquirer/checkbox` and `@inquirer/confirm` already used in init).

## Source Files
- `src/commands/init.ts` — added `BUNDLED_EXAMPLES_DIR`, `AVAILABLE_TEMPLATES`, `TemplateName`, `applyTemplate()`, `--template` and `--force` options, and the interactive template prompt in `registerInit()`
- `examples/book-authoring/` — new starter: manuscript/editorial/publishing hierarchy with vocabulary overrides
- `examples/cli-tool/` — new starter: command-interface/configuration hierarchy with CLI-appropriate DoD
- `docs/cli.md` — documents `--template` and `--force` flags; documents the interactive template prompt

## Commits
<!-- taproot-managed -->

## Tests
- `test/integration/starter-examples.test.ts` — covers all 6 ACs: webapp hierarchy structure, book-authoring vocabulary, cli-tool DoD, unknown template error, settings.yaml force/no-force behaviour, and validate-structure/validate-format for all three templates

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — applyTemplate() is a stateless function; file I/O via cpSync at command boundary only; no global mutable state; error messages are actionable | resolved: 2026-03-25T11:10:00.000Z
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: NOT APPLICABLE — no performance-sensitive code paths introduced; template copy is a one-time init operation | resolved: 2026-03-25T11:10:00.000Z

## Status
- **State:** in-progress
- **Created:** 2026-03-25
