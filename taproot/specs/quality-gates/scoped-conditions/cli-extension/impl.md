# Implementation: CLI Extension — scoped-conditions

## Behaviour
../usecase.md

## Design Decisions
- `when: source-matches: "<glob>"` is parsed as a string value on the condition object in YAML; the `when` field is added as an optional property to each object variant of `DodConditionEntry`
- Glob matching uses a minimal inline implementation (no new npm dependency): `*` → matches any char except `/`, `**` → matches any char including `/`, literals are regex-escaped. Covers all expected patterns from the spec.
- Source files are read via the existing `parseImplData` from `src/core/impl-reader.ts` — reuses the same parsing already used by `check-orphans` and `sync-check`
- When no source files section exists in impl.md, all scoped conditions are auto-resolved as "not applicable — impl has no ## Source Files section" (AC-4)
- Malformed `when:` values (anything other than `source-matches: <glob>`) produce a parse-error result and are counted as failing (AC-5) — stops silently skipping unknown qualifiers
- The `when` check happens before `resolveCondition` — if a condition is scoped and no source file matches, a `pass` result is synthesised immediately and the condition is not executed

## Source Files
- `src/validators/types.ts` — added `WhenQualifier` type and `when?: WhenQualifier` to each object variant of `DodConditionEntry`
- `src/core/dod-runner.ts` — added `globMatches()`, `parseWhenQualifier()`, source-file read logic, and `when` dispatch in `runDodChecks`

## Commits
- (run `taproot link-commits` to populate)
- `f8ff32444896888e016fd747979f3dbcc112a024` — (auto-linked by taproot link-commits)
- `0922458eae7f4ec42e3ff525661d7995c3125526` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/scoped-conditions.test.ts` — AC-1: scoped no-match auto-resolves; AC-2: scoped match runs normally; AC-3: unscoped unaffected; AC-4: no source-files section auto-resolves; AC-5: malformed when produces error

## Status
- **State:** complete
- **Created:** 2026-03-28
- **Last verified:** 2026-03-28

## DoD Resolutions
- condition: document-current | note: updated docs/configuration.md with when: source-matches: qualifier syntax and docs/patterns.md with Scoped conditions pattern | resolved: 2026-03-28
- condition: check-if-affected: src/commands/update.ts | note: not applicable — update.ts regenerates skill/adapter files; no DoD condition parsing; unaffected by this change | resolved: 2026-03-28
- condition: check-if-affected: skills/guide.md | note: not applicable — guide.md is a user-facing skill reference; settings.yaml DoD syntax not documented there | resolved: 2026-03-28
- condition: check-if-affected: docs/ | note: updated docs/configuration.md (when: qualifier docs) and docs/patterns.md (Scoped conditions pattern) | resolved: 2026-03-28
- condition: check-if-affected: examples/ | note: not applicable — no examples use scoped conditions; adding a premature example would be speculative | resolved: 2026-03-28
- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: not applicable — TypeScript-only changes to types.ts and dod-runner.ts; no skill files or spec files modified | resolved: 2026-03-28
- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — no skill files modified | resolved: 2026-03-28
- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — no skill files modified | resolved: 2026-03-28
- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — no skill files modified | resolved: 2026-03-28
- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — no skill files modified | resolved: 2026-03-28
- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — no skill files modified | resolved: 2026-03-28
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — TypeScript-only changes; no new external dependencies; file reads in dod-runner.ts follow existing patterns already present in the same file | resolved: 2026-03-28
- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: no new settings.yaml entry needed — scoped conditions are a qualifier on existing DoD condition types, not a new cross-cutting concern requiring its own check-if-affected-by | resolved: 2026-03-28
- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: yes — documented Scoped conditions pattern in docs/patterns.md | resolved: 2026-03-28
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: not applicable — no skills/*.md files modified | resolved: 2026-03-28

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — TypeScript-only changes to types.ts and dod-runner.ts; no new external dependencies; no new CLI commands or database interactions | resolved: 2026-03-28
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: not applicable — usecase.md contains no NFR-N entries | resolved: 2026-03-28
