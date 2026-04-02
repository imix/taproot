# Skill: define-truth

## Description

Create or update a free-form truth entry in `taproot/global-truths/` — a fact, rule, term, convention, or decision that applies across the project. Accepts a pre-populated candidate from `/tr-discover-truths` or runs interactively.

## Inputs

- `candidate` (optional): Pre-populated context from `/tr-discover-truths` or `/tr-ineed` — includes term/rule, proposed scope, and evidence. If omitted, the skill asks interactively.
- `entry` (optional): Pre-drafted structured content assembled by a calling skill — a complete ADR, principle, convention, or external constraint already formatted and ready to write. If provided, all elicitation phases are skipped; the skill displays the draft and asks for confirmation only.

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

0. **Entry handoff (skip elicitation).** If `entry` was provided by a calling skill:
   - Display the drafted content:
     ```
     Here's what I've captured — does this look right?

     <entry content>
     ```
   - Present: `[A] Write it · [E] Edit · [C] Cancel`
   - **[A]**: proceed to Phase 4 (Find Existing Home) then Phase 5 (Write) with the entry as content. Use the structured format's scope and file defaults unless Phase 4 finds a better existing home.
   - **[E]**: apply the developer's corrections, re-display, and repeat until `[A]` or `[C]`.
   - **[C]**: stop. Do not write anything.

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

3. Confirm the truth content — the actual text to write into the file.

   **If `candidate` was provided** (pre-populated from discover-truths): always ask before drafting:
   > "[S] One sentence — just the rule  ·  [L] Longer — add rationale or examples"
   - **[S]**: draft a single sentence that states the rule, present it, ask "Does this work?"
   - **[L]**: ask "What should I include?" then draft; present and ask "Does this work?"
   - The developer may also just type the text they want directly — use it verbatim.

   **If no candidate** (interactive): ask:
   > "How would you like to phrase this truth? (One sentence is fine — anything from a single rule statement to a longer explanation.)"

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

After confirming a structured entry's content, proceed to Phase 4 (Find Existing Home) then Phase 5 (Write). Then ask: "Another structured truth, or done?" If another: return to step 2.

**Completeness check** — after ending a structured session covering 2 or more entries, briefly note any of the four formats not yet captured: "You've added [formats]. You haven't captured [remaining formats] — worth recording those now?"

---

### Phase 2 — Scope, File, and Convention (free-form path only)

3. Determine scope, file name, and storage convention. **Collapse into a single confirmation when possible:**

   - **Scope**: if `candidate` proposed a scope, use it without asking. Otherwise ask:
     > "Scope: **intent** (broadest — all levels) · **behaviour** · **impl** (narrowest)?"

   - **File name**: check `taproot/global-truths/` for existing files. If a file already exists whose name fits this truth (e.g. `architecture_intent.md` for an architecture principle), use it — just note "I'll append to `<name>`." Don't ask. If no obvious match, suggest one category-level name:
     > "I'll put this in `<suggested-name>_<scope>.md` — ok, or different name?"

   - **Convention**: if the project already uses one convention (suffix or sub-folder), match it silently. If no files exist yet, default to suffix and note the choice; only ask if the developer seems likely to care.
     - Suffix example: `taproot/global-truths/glossary_intent.md`
     - Sub-folder example: `taproot/global-truths/intent/glossary.md`

   The goal is zero questions when context is clear. Ask only what's genuinely ambiguous.

### Phase 4 — Find Existing Home (all paths)

This phase runs for every path — structured, free-form, and entry handoff. Do not skip it.

5. Scan all `.md` files in `taproot/global-truths/`. For each file, read its headings and content summary. Check whether the new truth fits topically into an existing file — e.g. a new convention belongs in `conventions_impl.md`, a new principle belongs alongside existing principles.

   - **Match found and file is not overloaded** (fewer than ~10 top-level entries): use that file. Note: "I'll append to `<file>`." Do not ask unless the match is ambiguous.
   - **Match found but file is large** (10+ top-level entries): propose a split before writing: "⚠ `<file>` already has N entries. Before adding more, consider splitting it — e.g. `<domain>_<scope>.md` for the related group. [A] Split first · [B] Append anyway"
   - **No match**: proceed with the file name from Phase 2 (free-form), the structured path default, or the entry handoff default.

   For **structured path** and **entry handoff**: this step overrides the format's file default when a better existing home is found. The default (`conventions_impl.md`, `principles_intent.md`, etc.) is a fallback, not a mandate.

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

- Truth content is free-form — no schema is enforced. The developer chooses prose, tables, bullet lists, or headings. **A single sentence is sufficient for enforcement** — the truth-check hook reads the file verbatim and checks staged changes for consistency. Longer explanations help future readers but are not required for the hook to work.
- Both conventions (suffix and sub-folder) may coexist in the same project. Neither is preferred.
- Scope resolution precedence: sub-folder takes precedence over suffix when they conflict (most restrictive wins).
- This skill is the target of `/tr-ineed` routing when a requirement is classified as a project-wide truth.
- When invoked from `/tr-discover-truths`, the `candidate` argument pre-populates steps 1–3, making the interaction faster.
- Structured formats and their scope defaults: Decisions → `impl`; Principles → `intent`; Conventions → `impl`; External constraints → `intent`.
- Structured format authoring was originally a separate skill (`/tr-design-constraints`). It was absorbed here so developers invoke one command regardless of truth type. See the originating spec: `taproot/specs/global-truth-store/author-design-constraints/usecase.md`.
