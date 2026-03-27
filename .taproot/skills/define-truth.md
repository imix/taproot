# Skill: define-truth

## Description

Create or update a truth entry in `taproot/global-truths/` — a fact, business rule, glossary term, or convention that applies across the project. Accepts a pre-populated candidate from `/tr-discover-truths` or runs interactively.

## Inputs

- `candidate` (optional): Pre-populated context from `/tr-discover-truths` or `/tr-ineed` — includes term/rule, proposed scope, and evidence. If omitted, the skill asks interactively.

## Steps

### Phase 1 — Establish Content

1. If `candidate` was provided, display it:
   ```
   Candidate: `<term or rule>`
   Proposed scope: <intent | behaviour | impl>
   Evidence: <spec paths where this appeared>
   ```
   Ask: "Does this look right, or would you like to adjust the content or scope before I write the file?"

   If no `candidate`, ask:
   > "What truth do you want to capture? Describe the term, rule, or convention — and any context that would help scope it."

   Wait for the developer's description before continuing.

2. Confirm the truth content — the actual text to write into the file. Ask if not already clear:
   > "How would you like to phrase this truth? (Free-form markdown — prose, table, bullet list, or heading are all valid.)"

### Phase 2 — Determine Scope

3. If scope is not already confirmed, ask:
   > "What scope should this truth have?
   > - **intent** — applies to intent, behaviour, and implementation levels (broadest)
   > - **behaviour** — applies to behaviour and implementation levels
   > - **impl** — applies to implementation level only (narrowest)"

   Wait for the developer's choice.

### Phase 3 — Name the File

4. Propose a category-level name for the file — one that can hold multiple related truths, not the specific term being captured now:

   > "What should the file be called? Pick a category name so related truths can live together:
   >
   > Suggested names by scope:
   > - **intent**: `glossary` · `principles` · `ux-principles` · `domain-model` · `system-context`
   > - **behaviour**: `principles` · `guarantees` · `rules`
   > - **impl**: `architecture` · `tech-choices` · `patterns`
   >
   > (Or enter your own name — keep it generic enough to hold future truths of the same kind.)"

   If a file with that name already exists at the target path, note it:
   > "A file `<name>_<scope>.md` already exists — I'll append to it rather than create a new one."

### Phase 4 — Choose Convention

5. Ask which storage convention to use:
   > "Which convention do you prefer?
   > - **[S] Suffix** — `<name>_<scope>.md` in `taproot/global-truths/` (e.g. `glossary_intent.md`)
   > - **[F] Sub-folder** — `<scope>/<name>.md` in `taproot/global-truths/` (e.g. `intent/glossary.md`)
   >
   > Both are valid. Use suffix if you have few truths; sub-folder if you expect many."

   If the project already has truth files using one convention, note it:
   > "Your project currently uses the <suffix|sub-folder> convention — using it here keeps things consistent."

### Phase 5 — Write the File

6. Determine the file path:
   - **Suffix**: `taproot/global-truths/<name>_<scope>.md`
   - **Sub-folder**: `taproot/global-truths/<scope>/<name>.md`

   Create `taproot/global-truths/` if it does not exist.

7. If the file already exists, read it and present:
   > "A truth file already exists at `<path>`. Here's the current content: [excerpt]. Do you want to [A] append to it, [B] replace it, or [C] cancel?"
   Wait for the developer's choice.

8. Write the truth file with the confirmed content. Report:
   > "✓ Written: `<path>` (scope: <scope>)"

9. **Scope ambiguity check** — if the file was placed directly in `taproot/global-truths/` with no `_<scope>` suffix and not inside a scoped sub-folder, warn:
   > "`<filename>` has no scope signal — it defaults to intent scope (applies everywhere). Add a `_intent`, `_behaviour`, or `_impl` suffix, or move it to a scoped sub-folder, to make the scope explicit."

10. **Conflicting scope signals check** — if the file has both a suffix and is inside a scoped sub-folder that disagree, warn:
   > "`<path>` has conflicting scope signals — sub-folder (`<folder-scope>`) is more restrictive than suffix (`<suffix-scope>`). The restrictive scope (`<folder-scope>`) applies. Rename or move the file to resolve."

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

**What's next?**
[A] `/tr-discover-truths` — scan the hierarchy for more truth candidates
[B] `/tr-commit` — commit the new truth file
[C] Define another truth — run `/tr-define-truth` again

## Output

- A truth file written to `taproot/global-truths/<name>_<scope>.md` or `taproot/global-truths/<scope>/<name>.md`
- Any scope ambiguity or conflict warnings surfaced inline

## CLI Dependencies

None.

## Notes

- Truth content is free-form — no schema is enforced. The developer chooses prose, tables, bullet lists, or headings.
- Both conventions (suffix and sub-folder) may coexist in the same project. Neither is preferred.
- Scope resolution precedence: sub-folder takes precedence over suffix when they conflict (most restrictive wins).
- This skill is the target of `/tr-ineed` routing when a requirement is classified as a project-wide truth.
- When invoked from `/tr-discover-truths`, the `candidate` argument pre-populates steps 1–3, making the interaction faster.
