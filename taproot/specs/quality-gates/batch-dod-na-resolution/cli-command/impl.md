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
- `2de7348a1129a102367e679fe44ffb832fcb8656` — (auto-linked by taproot link-commits)
- `aaa65f59fb1caf7c6c7eb2cdcc99a6259280846e` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/batch-dod-na-resolution.test.ts` — covers AC-1 through AC-10: naRules matching, predicate evaluation, protected conditions, dry-run, auditability, skip-already-resolved, no-naRules path, custom rules, unknown-when warning

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: reviewed docs/architecture.md; this implementation adds a new CLI flag to an existing command and extends TaprootConfig with a new optional field. No new modules, no new commands registered. Config-driven — no logic hardcoded. Agent-agnostic output preserved. Compliant. | resolved: 2026-03-30
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: not applicable — batch-dod-na-resolution/usecase.md contains no NFR-N entries in ## Acceptance Criteria. No performance, reliability, or accessibility thresholds. | resolved: 2026-03-30

## Status
- **State:** complete
- **Created:** 2026-03-30
- **Last verified:** 2026-04-09

## DoD Resolutions
- condition: document-current | note: docs/cli.md: added --resolve-all-na flag to taproot dod synopsis and added description paragraph. docs/configuration.md: added naRules section documenting when predicates, protected conditions, and default rules. taproot/agent/ synced. README.md does not enumerate individual CLI flags. Docs current. | resolved: 2026-03-30T05:37:14.269Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: APPLIES — skills/commit.md modified. Reviewed added text: references 'taproot dod <impl-path> --resolve-all-na' CLI command only. No shell execution introduced, no credentials or tokens, no elevated permissions. Least-privilege preserved. Compliant. | resolved: 2026-03-30T05:37:56.325Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: NO — the naRules config pattern is documented in docs/configuration.md as a configuration feature. It is specific to DoD resolution and not a broadly reusable implementation pattern. | resolved: 2026-03-30T05:37:56.325Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: NO — naRules is a resolution mechanism, not a new gate condition. It does not introduce a cross-cutting concern that would require checking all future implementations. No new settings.yaml entry needed. | resolved: 2026-03-30T05:37:56.325Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — reviewed docs/architecture.md. Implementation adds --resolve-all-na flag to existing dod command and NaRule interface to TaprootConfig. No new modules, no new CLI commands registered, no module boundary crossings. Config-driven — rules live in settings.yaml. Filesystem-as-data-model preserved. Agent-agnostic output. Compliant. | resolved: 2026-03-30T05:37:56.324Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: NOT APPLICABLE — this implementation does not add a new pattern to docs/patterns.md. The naRules config mechanism is documented in docs/configuration.md as a configuration feature, not a reusable pattern for other implementations. | resolved: 2026-03-30T05:37:56.323Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: APPLIES — skills/commit.md modified. The note references taproot dod --resolve-all-na (a DoD command), not a commit command. Does not add a commit instruction; references the CLI for DoD only. Follows commit-awareness guidance. Compliant. | resolved: 2026-03-30T05:37:42.781Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: APPLIES — skills/commit.md modified. The added sentence is one line in the DoD resolution step. (C-3) Not repeated cross-skill. (C-4) No unconditional pre-load. (C-5) No /compact trigger. Compliant. | resolved: 2026-03-30T05:37:42.780Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: APPLIES — skills/commit.md modified. No new multi-document operation added. The note references a CLI command, not a new pause/confirm step. Compliant. | resolved: 2026-03-30T05:37:42.780Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: APPLIES — skills/commit.md modified. The added note is in the DoD resolution steps, not a What's next? block. No new output-producing step added. Existing What's next? blocks unchanged. Compliant. | resolved: 2026-03-30T05:37:42.780Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: APPLIES — skills/commit.md modified. Reviewed the added text: 'use taproot dod <impl-path> --resolve-all-na instead' — generic CLI command, no agent-specific names, no @{project-root} syntax. Compliant. | resolved: 2026-03-30T05:37:42.778Z

- condition: check-if-affected: docs/ | note: AFFECTED AND UPDATED — docs/cli.md: added --resolve-all-na synopsis and description. docs/configuration.md: added naRules section. Both synced to taproot/agent/docs/. | resolved: 2026-03-30T05:37:22.674Z

- condition: check-if-affected: examples/ | note: No new user-visible workflows introduced by --resolve-all-na. Existing examples are unaffected. examples/ unchanged. | resolved: 2026-03-30T05:37:22.674Z

- condition: check-if-affected: skills/guide.md | note: No new user-facing slash commands added. skills/guide.md unchanged. | resolved: 2026-03-30T05:37:22.674Z

- condition: check-if-affected: src/commands/update.ts | note: No new registerable skill files added. skills/commit.md was modified but is already tracked by update.ts. No new SKILL_FILES entries needed. update.ts unchanged. | resolved: 2026-03-30T05:37:22.673Z

- condition: check-if-affected: package.json | note: No new npm dependencies. NaRule interface and naRules field are TypeScript-only additions. package.json unchanged. | resolved: 2026-03-30T05:37:22.671Z

