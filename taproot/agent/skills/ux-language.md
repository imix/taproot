# Skill: ux-language

## Description

Elicit and capture language UX conventions for the project: copy tone, canonical terminology, locale handling, variable-length text rules, and pluralization and formatting conventions. Writes `ux-language_behaviour.md` to `taproot/global-truths/`.

## Inputs

- `surface` (optional): Target surface type — `cli`, `web`, `mobile`, `desktop`. If omitted, the skill asks.

## Steps

1. Scan `taproot/global-truths/` for an existing `ux-language_behaviour.md`. If found, read it and note current conventions.

2. Scan the codebase for language patterns:
   - Copy tone signals: formal/informal, terse/conversational, first/second person
   - Recurring terminology: canonical names for concepts, deprecated synonyms
   - Locale or translation structures: locale config, translation files, locale switching
   - Variable-length text handling: truncation, wrapping, abbreviated forms
   - Pluralization and formatting: count display, units, date/time format

   Report what was found with source file references.

3. Ask targeted questions:

   > **Language conventions — [surface type]**
   >
   > - What is the copy tone? (friendly/casual, professional/formal, technical/precise, terse)
   > - What terminology is preferred, and what terms are deprecated or off-limits?
   > - Does the product support multiple locales? If so, how are strings managed?
   > - How are variable-length strings handled in constrained spaces? (truncation rule, abbreviation, wrapping)
   > - How are plurals and counts formatted? ("1 item" vs "1 items", units, zero-state)
   > - How are dates, times, and numbers formatted — fixed format or locale-aware?

4. Draft `ux-language_behaviour.md`:

   ```markdown
   ## Language conventions

   ### Tone
   [Copy tone and voice style]

   ### Terminology
   [Preferred terms and deprecated synonyms]

   ### Locale and internationalisation
   [Supported locales, string management approach, locale-specific rules if any]

   ### Variable-length text
   [Truncation, abbreviation, and wrapping rules for constrained spaces]

   ### Pluralization and formatting
   [Count display, units, date/time format]

   ## Agent checklist

   Before writing any user-visible copy:
   - [ ] Does the copy match the project's tone convention?
   - [ ] Are all terms from the canonical terminology list used correctly?
   - [ ] If the string appears in a constrained space, does it follow the variable-length rule?
   - [ ] Are plurals and counts formatted correctly (including zero and one)?
   - [ ] Are dates, times, and numbers formatted per the project convention?
   ```

5. Present for confirmation:

   > **[artifact-review]** Draft conventions ready.
   > **[A]** Write (or extend if existing)  **[B]** Replace existing  **[C]** Cancel

6. On **[A]**: write or append `taproot/global-truths/ux-language_behaviour.md`. Report path written.

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

> **What's next?**
> [1] `/tr-ux-accessibility` — define accessibility conventions
> [2] `/tr-ux-define` — return to module orchestrator
> [3] `/tr-commit` — commit the new truth file

## Output

`taproot/global-truths/ux-language_behaviour.md` — conventions and agent checklist for language patterns.

## CLI Dependencies

None.

## Notes

- Terminology captured here overlaps with `taproot/global-truths/` glossary files. If a glossary already exists, check for duplicates before writing — extend the glossary rather than creating parallel terminology lists.
- If invoked from `/tr-ux-define`, skip the What's next block and return control to the orchestrator.
