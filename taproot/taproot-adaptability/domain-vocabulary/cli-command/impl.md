# Implementation: CLI Command — domain vocabulary substitution

## Behaviour
../usecase.md

## Design Decisions
- `applyVocabulary(content, vocab, structuralKeys)` lives in `src/core/language.ts` — pure logic, no I/O, consistent with `substituteTokens`; vocabulary object passed down from command boundary
- Declaration-order substitution (not length-sorted) — matches the usecase spec; single-pass via placeholder trick (same mechanism as `substituteTokens`)
- Structural key conflict detection: the loaded language pack's keys form the protected set; any vocab key that matches a structural key (case-insensitive) is skipped with a warning
- Empty-string value check happens in `update.ts` at the command boundary (I/O layer), not in core — complies with architecture constraint
- `TaprootConfig.vocabulary` is `Record<string, string> | undefined`; `deepMerge` already handles plain objects so no config.ts changes needed
- Vocabulary is applied as a second pass after the language pack in both `installSkills()` and `loadSkills()` — ordering guaranteed by call sequence

## Source Files
- `src/core/language.ts` — add `applyVocabulary(content, vocab, structuralKeys): { result: string; warnings: string[] }`
- `src/validators/types.ts` — add `vocabulary?: Record<string, string>` to `TaprootConfig`
- `src/commands/update.ts` — load `config.vocabulary`, validate (no empty values, abort if found), pass to `installSkills()` as second pass
- `src/commands/init.ts` — extend `installSkills(dir, force, pack, vocab?)` to apply vocabulary after language pack
- `src/adapters/index.ts` — extend `loadSkills(pack, vocab?)` to apply vocabulary after language pack

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/unit/vocabulary.test.ts` — unit tests: applyVocabulary replaces tokens, declaration-order semantics, longer-key-before-shorter not required (spec says declaration-order), conflict detection warns and skips, empty-string value error, empty vocab no-op, null vocab no-op
- `test/integration/domain-vocabulary.test.ts` — integration: AC-1 vocab applied at update, AC-2 re-run reapplies, AC-3 structural keyword conflict warning, AC-4 language pack runs before vocab, AC-5 empty/absent vocab no errors

## Status
- **State:** in-progress
- **Created:** 2026-03-24

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — applyVocabulary() is pure logic in src/core/language.ts (no I/O). Empty-value validation and vocabulary loading happen in src/commands/update.ts at the command boundary. Config is loaded once at entry and passed down. Follows exact same pattern as language pack substitution. | resolved: 2026-03-24
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: NFR-1 present — "under 200ms on a standard developer machine" — measurable (number + unit). Single-pass string substitution over ~30 skill files with ≤50 vocab keys is O(files × keys × avg_content_length). At ~50KB total content and 50 keys, well under 200ms. | resolved: 2026-03-24
