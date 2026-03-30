# Implementation: CLI Command

## Behaviour
../usecase.md

## Design Decisions
- **`naRules` in `TaprootConfig`, not in `dod-runner.ts`**: NA rules are project configuration, not implementation logic. They live in `settings.yaml` alongside `definitionOfDone`, parsed by `config.ts`, and typed in `TaprootConfig`. The dod command reads them from config — no rules are hardcoded.
- **`--resolve-all-na` as a separate action path in `dod.ts`**: Mirrors the existing `--resolve` action path. Both short-circuit the normal DoD run flow.
- **Protected conditions are hardcoded in the command**: `document-current`, `tests-passing`, `baseline-*`, and `check:` (free-form) can never be auto-resolved regardless of `naRules`. This is a safety invariant, not a configuration concern.
- **Unresolved detection via DodResult output prefix**: Agent-check conditions produce `output: "Agent check required: ..."`. This is the signal used to detect auto-resolvable conditions rather than re-parsing condition types from config — avoids coupling to condition internals.
- **`when` predicate vocabulary closed in the command**: `prose-only` and `no-skill-files` are evaluated against `## Source Files` paths. Unknown `when` values produce a warning and the rule is skipped (AC-10).
- **`--dry-run` takes precedence**: When combined with `--resolve-all-na`, `--dry-run` suppresses all writes. The report shows what would be resolved.
- **init.ts ships default `naRules`**: The default `naRules` block is added to newly-generated `settings.yaml`. Existing projects must add it manually or run `taproot update`.
- **commit.md skill updated**: "One condition per invocation" guidance relaxed to note that `--resolve-all-na` handles NA conditions in bulk.

## Source Files
- `src/validators/types.ts` — added `NaRule` interface and `naRules?: NaRule[]` field to `TaprootConfig`
- `src/commands/dod.ts` — added `--resolve-all-na` option and `resolveAllNa()` function
- `src/commands/init.ts` — added default `naRules` block to generated `settings.yaml`
- `skills/commit.md` — updated DoD one-condition guidance to mention `--resolve-all-na`
- `taproot/agent/skills/commit.md` — synced copy

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/batch-dod-na-resolution.test.ts` — covers AC-1 through AC-10: naRules matching, predicate evaluation, protected conditions, dry-run, auditability, skip-already-resolved, no-naRules path, custom rules, unknown-when warning

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: reviewed docs/architecture.md; this implementation adds a new CLI flag to an existing command and extends TaprootConfig with a new optional field. No new modules, no new commands registered. Config-driven — no logic hardcoded. Agent-agnostic output preserved. Compliant. | resolved: 2026-03-30
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: not applicable — batch-dod-na-resolution/usecase.md contains no NFR-N entries in ## Acceptance Criteria. No performance, reliability, or accessibility thresholds. | resolved: 2026-03-30

## Status
- **State:** in-progress
- **Created:** 2026-03-30
- **Last verified:** 2026-03-30
