# Skill: design-constraints

## Description

Capture project-wide constraints in a structured session — architectural decisions (ADR format), design principles, conventions and rules, or external constraints imposed from outside. Writes structured entries to `taproot/global-truths/`.

## Inputs

- `category` (optional): Pre-selected format — `decision`, `principle`, `convention`, or `external`. If omitted, the skill asks interactively or classifies from description.

## Steps

1. **Format selection** — Ask: "What kind of constraint do you want to capture?"
   - **[D] Decision** — something your team chose from options (architecture, security approach, tooling, accessibility library)
   - **[P] Principle** — a design value guiding ongoing choices (UX, accessibility, sustainability, performance philosophy)
   - **[R] Rule / Convention** — a specific constraint with right/wrong examples (naming, coding style, data handling, security rules)
   - **[E] External constraint** — imposed from outside; not your team's choice (third-party API, regulatory requirement, legacy system, client contract)

   If the developer describes a constraint without naming the format, classify it:
   - Sounds like a choice between options → suggest [D]
   - Sounds like a design value or philosophy → suggest [P]
   - Sounds like a specific do/don't rule → suggest [R]
   - Sounds like an external imposition → suggest [E]
   Ask: "That sounds like a [format] — is that right?" and confirm before proceeding.

2. **[D] Decision — ADR format:**
   a. Check early: "Was this imposed on you, or did your team choose it? If it was imposed, this may be better captured as an External constraint [E]."
   b. Ask: "Describe the situation — what problem or context prompted this decision?"
   c. Ask: "What options did you consider? For each, what was the key trade-off?"
   d. Ask: "Which option did you choose, and why?"
   e. Ask: "What consequences follow — benefits you expect and trade-offs you accept?"
   f. If the developer hasn't decided yet: record as open — "Status: open" with context and options listed; note: "Recorded as open — will not constrain specs until resolved."
   g. Propose scope: **impl** (default for technology choices) | **behaviour** | **intent**
   h. Propose file name: `architecture_impl.md` (default) — or ask if the domain warrants a different name (e.g. `security_impl.md`, `infra_impl.md`)
   i. Format the entry:
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

3. **[P] Principle — Principle format:**
   a. Ask: "Name this principle in 3–5 words."
   b. Ask: "What is the rationale — why does this principle exist in your project?"
   c. Ask: "Give an example of applying this principle correctly."
   d. Ask: "Give an example of violating this principle." If the developer cannot provide one, proceed without it and note: "A violation example would make this principle more testable — consider adding one later."
   e. Propose scope: **intent** (default — cross-cutting values) | **behaviour**
   f. Propose file name: `principles_intent.md` (default) — or a domain-specific name (e.g. `ux-principles_intent.md`, `security-principles_impl.md`)
   g. Format the entry:
      ```
      ## [Principle name]

      **Rationale:** [why this principle exists]
      **Correct:** [example of following it]
      **Violation:** [example of ignoring it] (if provided)
      ```

4. **[R] Rule / Convention — Rule format:**
   a. Ask: "Describe the rule — what must always (or never) be done?"
   b. Ask: "Give a correct example."
   c. Ask: "Give an incorrect example."
   d. Ask: "Is there a rationale worth recording?" (optional)
   e. Ask: "Are there known exceptions?" If yes, ask the developer to describe them.
   f. If the rule is too broad to produce a clear example (e.g. "write clean code"), ask: "Can you make this more specific — what would a developer do differently by following this rule?"
   g. Propose scope: **impl** (default for coding conventions) | **behaviour** | **intent**
   h. Propose file name: `conventions_impl.md` (default) — or a domain-specific name (e.g. `naming_intent.md`, `api-rules_impl.md`)
   i. Format the entry:
      ```
      ## [Convention name]

      **Rule:** [rule statement]
      **Correct:** [example]
      **Incorrect:** [example]
      **Rationale:** [why this rule exists] (if provided)
      **Exceptions:** [known exceptions] (if any)
      ```

5. **[E] External constraint — External format:**
   a. Ask: "Describe the constraint — what are you required to do, use, or avoid?"
   b. Check early: "Was this imposed on you, or did your team choose it? If your team chose it, this is better captured as a Decision [D]." Redirect if confirmed.
   c. Ask: "Who or what imposed this? (e.g. client contract, regulator, platform, legacy system, corporate policy)"
   d. Ask: "What are the implications for the project?"
   e. Ask: "Is there an expiry or review date?" (optional)
   f. Ask: "Is there a known workaround or mitigation?" (optional)
   g. Propose scope: **intent** (default — external constraints typically affect the whole project) | **behaviour** | **impl**
   h. Propose file name: `external-constraints_intent.md` (default) — or a domain-specific name (e.g. `regulatory_intent.md`, `platform-limits_impl.md`)
   i. Format the entry:
      ```
      ## [Constraint title]

      **Source:** [who or what imposed this]
      **Constraint:** [what is required or forbidden]
      **Implications:** [what this means for the project]
      **Expiry/Review:** [date or condition, if known]
      **Workaround:** [mitigation, if any]
      ```

6. **Contradiction check** — Before writing, read the target truth file if it already exists. If the new entry appears to contradict an existing entry, flag it:
   > "This appears to contradict an existing entry: [excerpt]. [A] update the existing entry, [B] record both with a distinction note, [C] cancel."
   Wait for the developer's choice before writing.

7. **Write** — Append the formatted entry to the target truth file (creating it if absent). Confirm: "Written — [entry title] added to `<path>`."

8. **Loop** — Ask: "Another constraint, or done?" If another: return to step 1. If done: proceed to step 9.

9. **Completeness check** — Note which of the four formats were not used in this session and ask: "You haven't captured any [format(s)] yet — would you like to add some now?" Developer may decline.

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

**What's next?**
[1] `/tr-define-truth` — capture a free-form truth (DB schema, API contract, glossary) not suited to these formats
[2] `/tr-discover-truths` — scan existing specs for implicit truth candidates
[3] `/tr-commit` — commit the new truth files

## Output

One or more truth files written or appended in `taproot/global-truths/` with structured, consistently formatted entries.

## CLI Dependencies

None.

## Notes

- For free-form truths — DB schemas, API contracts, data dictionaries, reference tables — use `/tr-define-truth` directly. This skill is for constraints that benefit from structured prompting.
- Scope conventions: Decisions default to `impl` (technology choices); Principles default to `intent` (cross-cutting values); Conventions default to `impl` (coding rules); External constraints default to `intent` (project-wide impositions). Developers may choose any scope.
- Sub-behaviour specs for each format: `global-truth-store/author-design-constraints/usecase`
