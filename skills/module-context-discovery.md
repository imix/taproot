# Skill: module-context-discovery

## Description

Establish the project context record used by all quality modules: product type, target audience, and quality goals. Run once before activating any module; re-run to update or reset the record.

## Inputs

None required.

## Steps

1. Read `taproot/global-truths/project-context_intent.md` if it exists.

2. **If the record exists:**

   > **Project context — existing record**
   >
   > Product type: [value]
   > Target audience: [value]
   > Quality goals: [value]
   >
   > **[K]** Keep and continue   **[U]** Update — revise fields   **[R]** Reset — discard and re-run discovery

   - On **[K]**: report "Using existing project context." and stop (or return to calling orchestrator).
   - On **[U]**: present each field for review; developer amends any or all; proceed to step 6.
   - On **[R]**: discard record and proceed to step 3.

3. **Ask product type:**

   > What type of product is this?
   >
   > Common archetypes: marketing website, productivity app, developer tool, design showcase, e-commerce store, consumer mobile app, internal dashboard.
   >
   > Describe freely — the archetype is used to propose sensible defaults for each module aspect.
   >
   > **[?]** Get help — agent will scan the project and propose a product type

   - On **[?]**: scan `taproot/`, existing specs, and codebase for signals (product name, readme, routes, domain language). Propose a product type with a one-paragraph explanation. Developer confirms, adjusts, or overrides.

4. **Ask target audience:**

   > Who are the primary users, and what do they come here to accomplish?
   >
   > Example: "Marketing managers who need to schedule and publish campaigns without developer help."
   >
   > **[?]** Get help — agent will infer the audience from project context

   - On **[?]**: scan specs and codebase for audience signals (onboarding flows, role language, existing personas). Propose a target audience description with reasoning. Developer confirms, adjusts, or overrides.

5. **Ask quality goals:**

   > Which 2–3 quality goals matter most for this product?
   >
   > Examples: visual polish, performance, simplicity, trust and credibility, accessibility, discoverability, developer ergonomics, reliability.
   >
   > **[?]** Get help — agent will suggest quality goals based on product type and audience

   - On **[?]**: draw on domain knowledge for the product archetype and audience. Propose 2–3 quality goals with a brief rationale for each. Include one or two alternatives with trade-offs so the developer can choose. Developer confirms, adjusts, or overrides.

6. Present a summary for confirmation:

   > **Project context — summary**
   >
   > Product type: [value]
   > Target audience: [value]
   > Quality goals: [value]
   >
   > **[Y]** Confirm and write   **[E]** Edit a field   **[S]** Skip — use generic defaults

   - On **[S]**: note "No context record written — modules will use generic defaults." Stop.
   - On **[E]**: return to the relevant step.

7. Write `taproot/global-truths/project-context_intent.md`:

   ```markdown
   ## Project context

   - **Product type:** [value]
   - **Target audience:** [value]
   - **Quality goals:** [value]
   ```

   Report: "✓ Written `taproot/global-truths/project-context_intent.md` — this record is used by all quality modules."

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

**What's next?**
[1] `/tr-ux-define` — activate the UX module (now uses this context for defaults)
[2] `/tr-commit` — commit the context record
[3] `/tr-status` — view coverage snapshot

## Output

`taproot/global-truths/project-context_intent.md` — product type, target audience, and quality goals used by all module sub-skills to propose context-appropriate defaults.

## CLI Dependencies

None.

## Notes

- This skill is called automatically by module orchestrators (e.g. `/tr-ux-define`) when no context record exists. Run it standalone to establish context before starting any module session.
- If invoked from a module orchestrator, skip the What's next block and return control to the orchestrator with the established context.
- A partial record is valid — unanswered fields are left undefined and modules fall back to generic defaults for those fields.
