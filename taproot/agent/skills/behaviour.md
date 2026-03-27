# Skill: behaviour

## Description

Define a UseCase (observable system behaviour) under an intent or another behaviour. Each behaviour is testable, has a clear actor, and describes what the system does — not how it does it.

## Inputs

- `parent` (required): Path to the parent intent folder or parent behaviour folder.
- `description` (required): Natural language description of the behaviour to define.

## Steps

1. Read the parent artifact at `parent`:
   - If `parent` contains `intent.md`: read the intent to understand the goal and success criteria.
   - If `parent` contains `usecase.md`: read the parent behaviour — this new behaviour is a sub-behaviour.

1a. **Pattern check** — If `taproot/agent/docs/patterns.md` exists, scan the behaviour description for semantic matches. Match signals:
   - "apply to all / every implementation / every skill" → `check-if-affected-by`
   - "enforce a rule / architectural constraint / agents should follow" → `check-if-affected-by`
   - "keep docs current / enforce documentation quality" → `document-current`
   - "every new feature must update X" → `check-if-affected: X`

   If a match is found, **interrupt before asking clarifying questions**:
   > "Before I write this spec — that sounds like the **`<pattern-name>`** pattern. <one-line description>. See `taproot/agent/docs/patterns.md`."
   > **[A] Use this pattern now** — I'll guide you through applying it instead of writing a spec
   > **[B] Continue writing the spec** — the spec is distinct from the pattern

   - **[A]**: guide the user through applying the pattern. Do not write a new `usecase.md`.
   - **[B]** or no match: proceed to step 1b.

1b. **Load applicable truths.** If `taproot/global-truths/` exists, collect truth files applicable at behaviour level:
   - Include files with `_intent` or `_behaviour` suffix, in an `intent/` or `behaviour/` sub-folder, or with no scope signal (treat as intent-scoped; note inline: "Applied `global-truths/<file>` as intent-scoped (no explicit scope signal)")
   - Do not include files scoped to `_impl` / `impl/` only
   - Read each applicable file; note defined terms, business rules, and conventions
   - If the draft spec contradicts an applicable truth, surface the conflict before saving: "This spec uses `<term>` in a way that conflicts with `global-truths/<file>`: `<excerpt>`. [A] update spec to align, [B] update the truth, [C] proceed with the conflict noted."

2. Read all sibling `usecase.md` files (other behaviours already under the same parent). Identify any overlap with the described behaviour and flag it: "There's an existing behaviour `<slug>` that covers X — should this new behaviour focus on Y specifically?"

3. Ask clarifying questions through dialogue until you have enough to write the full UseCase. Minimum required:
   - Who or what initiates this behaviour? (the Actor)
   - What must be true before this can happen? (Preconditions)
   - Walk me through the main steps — what does the user/system do, and what does the system respond?
   - What's true when it succeeds? (Postconditions)
   - What can go wrong, and how should the system respond? (Error Conditions)

4. Identify alternate flows and error conditions proactively — don't just ask for them. Walk every step in the main flow and challenge it:
   - "What if the input at this step is invalid or missing?"
   - "What if an external call here times out or returns an error?"
   - "What if the user navigates away or cancels mid-flow?"
   - "What if this step is attempted twice in a row?"
   Each recoverable branch becomes an **Alternate Flow** (with trigger + steps + outcome). Each unrecoverable failure becomes an **Error Condition** (with trigger + system response). Do not accept vague answers like "the request fails" — push for the specific trigger and the exact system response (e.g., "API returns 5xx — system shows inline error, preserves form state, and allows retry").

5. Generate a Mermaid diagram that visualises the main flow and key alternate/error branches. Use `sequenceDiagram` for actor–system interactions or `flowchart TD` for branching logic — choose whichever makes the flow most readable. This is the human-readable visual contract for the behaviour. Include it in the `## Flow` section of `usecase.md`.

6. Identify related behaviours. Scan sibling and parent behaviours for any that: share the same actor, share a precondition with this behaviour, produce an outcome this behaviour depends on, or are commonly triggered alongside this one. List them in `## Related` with a one-line note on the relationship (e.g., "must precede", "shares actor", "produces input for this flow").

7. Draft the `usecase.md`. Write main flow steps as active-voice actions: subject + verb + object. Bad: "The form is submitted." Good: "User submits the registration form."

7a. After writing the main flow, alternate flows, and error conditions, generate a `## Acceptance Criteria` section. Derive one Gherkin scenario per flow: the main flow, each named alternate flow, and each error condition. Assign stable IDs starting at `AC-1`. Insert the section immediately before `## Status`:

   ```markdown
   ## Acceptance Criteria

   **AC-1: <Happy path title>**
   - Given <precondition>
   - When <actor action>
   - Then <observable outcome>

   **AC-2: <Alternate flow title>**
   - Given <context>
   - When <trigger>
   - Then <system response>
   ```

   Note to developer: "I've generated N acceptance criteria — review and adjust the Given/When/Then wording before committing. IDs are immutable once assigned."

7b. After generating functional ACs, ask: "Are there quality constraints on this behaviour — performance targets, security requirements, reliability thresholds, or accessibility standards?" If yes, derive one `**NFR-N:**` entry per constraint using the NFR Gherkin pattern:
   - **Given** — the environmental or load condition (e.g. "500 concurrent users", "mobile network", "authenticated session")
   - **When** — the actor action that triggers measurement
   - **Then** — a measurable threshold: number + unit, named standard, or testable boolean condition

   Assign IDs starting at `NFR-1`, placed after the last functional AC. Note: "I've generated N NFR criteria — confirm the thresholds are specific and measurable before committing."

   If no quality constraints are identified, skip silently.

8. Determine the folder slug: kebab-case, verb-noun or noun phrase (e.g., `register-account`, `reset-password`, `verify-email-address`). Should be distinct from sibling behaviour slugs.

9. Create the directory `<parent>/<slug>/` and write `usecase.md`.

9b. **Optionally write `discussion.md`** — if the session involved meaningful discovery dialogue (scope decisions, alternate flows surfaced, pivotal questions that changed the spec), draft a brief `discussion.md` in the behaviour folder alongside `usecase.md`. Use the same four-section template as `tr-implement` (Pivotal Questions, Alternatives Considered, Decision, Open Questions) but set `Skill: tr-behaviour`. Skip if the spec authoring was straightforward with no significant exploration.

10. Update the parent document's `## Behaviours <!-- taproot-managed -->` section:
    - Read the parent `intent.md` (or parent `usecase.md` for sub-behaviours).
    - If the `## Behaviours` section does not exist, insert it immediately before `## Status` (or append at end of file if `## Status` is absent), with the heading `## Behaviours <!-- taproot-managed -->`.
    - Derive the link title from the first `# Heading` line of the new `usecase.md`; strip any type prefix (e.g. `# Behaviour: Foo` → `Foo`). Fall back to the folder slug if no heading is found.
    - Append `- [<Title>](./<slug>/usecase.md)` to the section if the link is not already present.
    - Write the updated parent document.

11. Run `taproot validate-structure --path <taproot-root>` and `taproot validate-format --path <parent>/<slug>/`.

12. If the behaviour has clear sub-components, suggest decomposition: "This behaviour has three distinct phases — would you like to break it into sub-behaviours: `<sub-slug-1>`, `<sub-slug-2>`, `<sub-slug-3>`?"

13. Present next steps:

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

   **What's next?**
   [A] `/tr-implement taproot/<parent>/<slug>/` — start building
   [B] `/tr-review taproot/<parent>/<slug>/usecase.md` — stress-test the spec first

## Output

A new `usecase.md` in `<parent>/<slug>/usecase.md`.

## CLI Dependencies

- `taproot validate-structure`
- `taproot validate-format`

## Document Format Reference

```markdown
# Behaviour: <Title>

## Actor
<Who or what initiates this behaviour>

## Preconditions
- <What must be true before this behaviour can occur>

## Main Flow
1. <Actor does something>
2. <System responds>
3. <Actor does something>

## Alternate Flows
### <Alternate flow name>
- **Trigger:** <When does this alternate flow occur?>
- **Steps:**
  1. <Step>
  2. <Step>

## Postconditions
- <What is true after successful completion>

## Error Conditions
- **<Trigger>**: <Exact system response — specific, not generic>

## Flow
```mermaid
sequenceDiagram
    Actor->>System: <initiating action>
    System-->>Actor: <response>
```

## Related
- `<path/to/sibling/usecase.md>` — <relationship: must precede / shares actor / produces input / commonly co-triggered>

## Acceptance Criteria

**AC-1: <Happy path title>**
- Given <precondition>
- When <actor action>
- Then <observable outcome>

**AC-2: <Alternate flow title>**
- Given <context>
- When <trigger>
- Then <system response>

## Status
- **State:** proposed | specified | implemented | tested | deprecated
- **Created:** <YYYY-MM-DD>
- **Last reviewed:** <YYYY-MM-DD>

## Notes
<Edge cases, open questions>
```

## Notes

- A behaviour should be completable in one user session. If it spans sessions or days, it is likely multiple behaviours.
- Aim for 3–7 steps in the main flow. Fewer usually means the behaviour is too abstract; more usually means it should be decomposed.
- The Mermaid diagram is the human-readable contract — it should be understandable by a non-technical stakeholder. Prefer `sequenceDiagram` for flows with clear actor–system turns; use `flowchart TD` for decision-heavy branching.
- Error conditions should be specific: name the exact trigger (HTTP 5xx, timeout, duplicate key) and the exact system response (error message shown, state preserved, retry offered). Vague conditions ("request fails") are not acceptable.
- Related behaviours are not just cross-references — they define the dependency graph that `/tr-analyse-change` uses for impact analysis.
