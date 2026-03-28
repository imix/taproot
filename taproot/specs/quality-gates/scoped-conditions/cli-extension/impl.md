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
- `src/validators/types.ts` — added `when?: string` to each object variant of `DodConditionEntry`
- `src/core/dod-runner.ts` — added `globMatches()`, `parseWhenQualifier()`, source-file read logic, and `when` dispatch in `runDodChecks`

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/scoped-conditions.test.ts` — AC-1: scoped no-match auto-resolves; AC-2: scoped match runs normally; AC-3: unscoped unaffected; AC-4: no source-files section auto-resolves; AC-5: malformed when produces error

## Status
- **State:** in-progress
- **Created:** 2026-03-28
- **Last verified:** 2026-03-28

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — TypeScript-only changes to types.ts and dod-runner.ts; no new external dependencies; no new CLI commands or database interactions | resolved: 2026-03-28
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: not applicable — usecase.md contains no NFR-N entries | resolved: 2026-03-28
