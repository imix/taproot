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
- `e41c5ed903fdc2f79ab058ac28059db0820e75f5` — (auto-linked by taproot link-commits)
- `731738eeb33a0654bc8a51f3dd94045f3867c8e5` — (auto-linked by taproot link-commits)

## Tests
- `test/unit/vocabulary.test.ts` — unit tests: applyVocabulary replaces tokens, declaration-order semantics (prefix of longer key wins if declared first), conflict detection warns and skips, empty-string value error, empty vocab no-op, null vocab no-op
- `test/integration/domain-vocabulary.test.ts` — integration: AC-1 vocab applied at update, AC-2 re-run reapplies, AC-3 structural keyword conflict warning, AC-4 language pack runs before vocab, AC-5 empty/absent vocab no errors

## Status
- **State:** complete
- **Created:** 2026-03-24
- **Last verified:** 2026-03-24

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — applyVocabulary() is pure logic in src/core/language.ts (no I/O). Empty-value validation and vocabulary loading happen in src/commands/update.ts at the command boundary. Config is loaded once at entry and passed down. Follows exact same pattern as language pack substitution. | resolved: 2026-03-24
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: NFR-1 present — "under 200ms on a standard developer machine" — measurable (number + unit). Single-pass string substitution over ~30 skill files with ≤50 vocab keys is O(files × keys × avg_content_length). At ~50KB total content and 50 keys, well under 200ms. | resolved: 2026-03-24

## DoD Resolutions
- condition: document-current | note: Updated docs/configuration.md: added vocabulary: to the settings.yaml example, added ## Vocabulary section documenting substitution semantics, structural keyword protection, and error conditions. | resolved: 2026-03-24T13:08:26.378Z
- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: NO — the vocabulary override mechanism is specific to taproot's skill file substitution. Not a general-purpose pattern for other projects. | resolved: 2026-03-24T13:10:58.165Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: NO — vocabulary substitution is opt-in via settings.yaml vocabulary: map. It does not impose new requirements on other implementations. | resolved: 2026-03-24T13:10:56.880Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — applyVocabulary() is pure logic in src/core/language.ts (no I/O). Vocabulary loading and empty-value validation happen at command boundary (src/commands/update.ts). Structural key conflict detection uses getStructuralKeys() which reads the loaded pack or falls back to English defaults — no module-level state. | resolved: 2026-03-24T13:08:37.648Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: NOT APPLICABLE — no new skills created. pattern-hints applies to skills that receive natural language intent. | resolved: 2026-03-24T13:08:36.427Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: NOT APPLICABLE — no skill files created or modified. commit-awareness applies to skills with git commit steps. | resolved: 2026-03-24T13:08:35.229Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: NOT APPLICABLE — no skill files created or modified. context-engineering applies to skill .md files. | resolved: 2026-03-24T13:08:33.974Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: NOT APPLICABLE — no new skills created. pause-and-confirm applies to skills that write multiple documents. | resolved: 2026-03-24T13:08:32.495Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: NOT APPLICABLE — no new skill files created. contextual-next-steps applies to skills that produce output to the developer. | resolved: 2026-03-24T13:08:31.280Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: NOT APPLICABLE — this is source code (core library + command modifications), not a skill file. agent-agnostic-language applies to skill .md files. | resolved: 2026-03-24T13:08:30.044Z

- condition: check-if-affected: skills/guide.md | note: NOT AFFECTED — guide.md documents workflow commands, not configuration options. No update needed. | resolved: 2026-03-24T13:08:28.843Z

- condition: check-if-affected: src/commands/update.ts | note: YES — modified: added vocabulary validation (empty-string abort), loads config.vocabulary and passes to installSkills() as second pass after language pack. | resolved: 2026-03-24T13:08:27.584Z

