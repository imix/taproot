# Skill: define-truth

## Description

Create or update a truth entry in `taproot/global-truths/` — a fact, business rule, glossary term, convention, architecture decision, or principle that applies across the project. Accepts a pre-populated candidate from `/tr-discover-truths` or runs interactively.

For structured truths (architecture decisions, design principles, coding conventions, external constraints), the skill detects the format and prompts accordingly. For free-form truths (schemas, glossaries, domain models, reference data), it captures content directly.

## Inputs

- `candidate` (optional): Pre-populated context from `/tr-discover-truths` or `/tr-ineed` — includes term/rule, proposed scope, and evidence. If omitted, the skill asks interactively.

## Steps

### Phase 0 — First-Invocation Guidance (conditional)

1. Check whether `taproot/global-truths/` exists and contains any truth files (`.md` files at any depth).

   **If no truth files exist:**
   a. Read the `## What belongs in taproot/global-truths/` section from `.taproot/docs/patterns.md` (create the file with that section if it does not exist — see alternate flow in `guide-truth-capture/usecase.md`).
   b. Say: "Truth files are free-form — anything worth knowing across the project (prose, tables, bullet lists, any markdown). Common starting points: **glossary** (canonical terms), **domain model** (entity shapes), **architecture decisions**, **naming conventions**, **business rules**. You can also define any other type directly."
   c. Ask: "Which of these would you like to scaffold now? Enter names or numbers (e.g. 1 3), type your own category name, or press Enter to skip straight to defining a truth."
   d. For each selected category: note it as a pending file to create. After Phase 3 and 4 (scope and file naming), create a blank scoped file per category using the category name as the filename. Report each file created.
   e. If the developer skips (presses Enter): proceed directly to Phase 1 as normal.

   **If truth files already exist:** skip Phase 0 entirely.

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

2. **Classify for structured format.** After receiving the description, assess whether it fits one of four structured formats:
   - Sounds like a choice the team made between options (architecture, tooling, security approach) → **Decision** (ADR)
   - Sounds like a design value guiding ongoing choices (UX philosophy, performance stance) → **Principle**
   - Sounds like a specific do/don't rule with right/wrong examples (naming, coding style) → **Convention**
   - Sounds like an externally imposed requirement (regulator, client contract, legacy system) → **External constraint**

   If it matches one: "That sounds like a [Decision / Principle / Convention / External constraint] — I can use a structured format for richer capture. [Y] Use structured format · [N] Free-form"

   - **[Y]**: follow the **Structured path** section below, then skip to Phase 5 (Write).
   - **[N]** or no clear match: continue to step 3 (free-form path).

3. Confirm the truth content — the actual text to write into the file. Ask if not already clear:
   > "How would you like to phrase this truth? (Free-form markdown — prose, table, bullet list, or heading are all valid.)"

---

### Structured path

Use when the developer confirms a structured format in step 2.

**[D] Decision — ADR format:**
a. Check early: "Was this imposed on you, or did your team choose it? If it was imposed, this may be better captured as an External constraint."
b. Ask: "Describe the situation — what problem or context prompted this decision?"
c. Ask: "What options did you consider? For each, what was the key trade-off?"
d. Ask: "Which option did you choose, and why?"
e. Ask: "What consequences follow — benefits you expect and trade-offs you accept?"
f. If undecided: record as open — Status: open with context and options listed; note "Recorded as open — will not constrain specs until resolved."
g. Scope default: **impl** (technology choices) — ask if different scope needed
h. File default: `architecture_impl.md` — ask if domain warrants a different name (e.g. `security_impl.md`)
i. Format:
   ```
   ## [Decision title]

   **Status:** decided | open
   **Context:** [situation]
   **Options considered:**
   - [Option A]: [trade-off]
   - [Option B]: [trade-off]
   **Decision:** [chosen option and why]
   **Consequences:** [expected benefits and accepted trade-offs]
   ```

**[P] Principle — Principle format:**
a. Ask: "Name this principle in 3–5 words."
b. Ask: "What is the rationale — why does this principle exist in your project?"
c. Ask: "Give an example of applying this principle correctly."
d. Ask: "Give an example of violating this principle." If unavailable, proceed and note: "A violation example would make this principle more testable — consider adding one later."
e. Scope default: **intent** (cross-cutting values)
f. File default: `principles_intent.md` — or domain-specific (e.g. `ux-principles_intent.md`)
g. Format:
   ```
   ## [Principle name]

   **Rationale:** [why this principle exists]
   **Correct:** [example of following it]
   **Violation:** [example of ignoring it] (if provided)
   ```

**[R] Convention — Rule format:**
a. Ask: "Describe the rule — what must always (or never) be done?"
b. Ask: "Give a correct example."
c. Ask: "Give an incorrect example."
d. Ask: "Is there a rationale worth recording?" (optional)
e. Ask: "Are there known exceptions?" If yes, describe them.
f. If too broad to produce a clear example, ask: "Can you make this more specific — what would a developer do differently by following this rule?"
g. Scope default: **impl** (coding conventions)
h. File default: `conventions_impl.md` — or domain-specific (e.g. `naming_intent.md`)
i. Format:
   ```
   ## [Convention name]

   **Rule:** [rule statement]
   **Correct:** [example]
   **Incorrect:** [example]
   **Rationale:** [why this rule exists] (if provided)
   **Exceptions:** [known exceptions] (if any)
   ```

**[E] External constraint — External format:**
a. Ask: "Describe the constraint — what are you required to do, use, or avoid?"
b. Check: "Was this imposed on you, or did your team choose it? If your team chose it, this is better captured as a Decision." Redirect if confirmed.
c. Ask: "Who or what imposed this? (e.g. client contract, regulator, platform, legacy system)"
d. Ask: "What are the implications for the project?"
e. Ask: "Is there an expiry or review date?" (optional)
f. Ask: "Is there a known workaround or mitigation?" (optional)
g. Scope default: **intent** (project-wide impositions)
h. File default: `external-constraints_intent.md` — or domain-specific (e.g. `regulatory_intent.md`)
i. Format:
   ```
   ## [Constraint title]

   **Source:** [who or what imposed this]
   **Constraint:** [what is required or forbidden]
   **Implications:** [what this means for the project]
   **Expiry/Review:** [date or condition, if known]
   **Workaround:** [mitigation, if any]
   ```

After writing a structured entry, ask: "Another structured truth, or done?" If another: return to step 2.

---

### Phase 2 — Determine Scope (free-form path only)

3. If scope is not already confirmed, ask:
   > "What scope should this truth have?
   > - **intent** — applies to intent, behaviour, and implementation levels (broadest)
   > - **behaviour** — applies to behaviour and implementation levels
   > - **impl** — applies to implementation level only (narrowest)"

   Wait for the developer's choice.

### Phase 3 — Name the File (free-form path only)

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

### Phase 4 — Choose Convention (free-form path only)

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

7. If the file already exists, read it and check for contradictions first. If the new entry appears to contradict an existing entry, flag it:
   > "This appears to contradict an existing entry: [excerpt]. [A] Update the existing entry · [B] Record both with a distinction note · [C] Cancel"
   Wait for the developer's choice.

   Then present the existing content and ask: "[A] Append · [B] Replace · [C] Cancel"

8. Write the truth file with the confirmed content. Report:
   > "✓ Written: `<path>` (scope: <scope>)"

9. **Scope ambiguity check** — if the file was placed directly in `taproot/global-truths/` with no `_<scope>` suffix and not inside a scoped sub-folder, warn:
   > "`<filename>` has no scope signal — it defaults to intent scope (applies everywhere). Add a `_intent`, `_behaviour`, or `_impl` suffix, or move it to a scoped sub-folder, to make the scope explicit."

10. **Conflicting scope signals check** — if the file has both a suffix and is inside a scoped sub-folder that disagree, warn:
   > "`<path>` has conflicting scope signals — sub-folder (`<folder-scope>`) is more restrictive than suffix (`<suffix-scope>`). The restrictive scope (`<folder-scope>`) applies. Rename or move the file to resolve."

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

**What's next?**
[1] `/tr-discover-truths` — scan the hierarchy for more truth candidates
[2] `/tr-commit` — commit the new truth file
[3] Define another truth — run `/tr-define-truth` again
[4] `/tr-sweep` — apply this truth across relevant project files (source, docs, specs, security, etc.)

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
- Structured formats and their scope defaults: Decisions → `impl`; Principles → `intent`; Conventions → `impl`; External constraints → `intent`.
