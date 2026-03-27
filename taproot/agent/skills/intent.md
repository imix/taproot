# Skill: intent

## Description

Create a new business intent or refine an existing one. An intent captures the "why" and "for whom" — the goal, the stakeholders who care about it, and how you'll know it's been achieved.

## Inputs

- `description` (required unless `path` is given): Natural language description of the goal. Can be vague — the skill will clarify.
- `path` (optional): Path to an existing `intent.md` to refine rather than create new.

## Steps

### Creating a new intent

1. If the description is vague (under two sentences, or contains words like "improve", "better", "more" without specifics), ask up to three clarifying questions before drafting:
   - "Who benefits from this, and what specifically changes for them?"
   - "How would you know in 6 months that this was a success?"
   - "What is the biggest risk or constraint on achieving this?"

2. Search existing intents under `taproot/` for overlap. Read each `intent.md` found. If a closely related intent exists, show it to the user and ask: "This looks related to existing intent at `<path>`. Should I refine that one, or create a separate intent for a genuinely different goal?"

2a. **Load applicable truths.** If `taproot/global-truths/` exists, collect truth files applicable at intent level:
   - Include files with `_intent` suffix, in an `intent/` sub-folder, or with no scope signal (treat as intent-scoped; note inline: "Applied `global-truths/<file>` as intent-scoped (no explicit scope signal)")
   - Read each applicable file; note any defined terms, business rules, or conventions
   - If the draft contradicts an applicable truth, surface the conflict before writing: "This draft uses `<term>` in a way that conflicts with `global-truths/<file>`: `<excerpt>`. [A] update spec to align, [B] update the truth, [C] proceed with the conflict noted."

3. Draft the `intent.md` content:
   - Title: noun phrase capturing the desired outcome (e.g., "Password Reset Without Support", not "Password Reset Feature")
   - Stakeholders: at minimum the direct user/actor and the business/product owner; consider: ops, security, compliance, support, third-party integrators
   - Goal: 1–3 sentences, outcome-focused (what changes in the world), not solution-focused (not "we will build X")
   - Success Criteria: 2–5 items, each measurable (can be checked off), each from a stakeholder's perspective
   - Constraints: real constraints only (regulatory, contractual, architectural); avoid listing preferences as constraints
   - Status: `draft`
   - Dates: today's date for both Created and Last reviewed

4. Determine the folder slug: kebab-case, 2–4 words describing the intent (e.g., `password-reset`, `user-onboarding`, `payment-failure-recovery`).

5. Check if `taproot/<slug>/` already exists. If so, append a distinguishing suffix.

6. Create the directory `taproot/<slug>/` and write `intent.md`.

7. Run `taproot validate-format --path taproot/<slug>/`.

8. If validation passes, present next steps:

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

   **What's next?**
   [A] `/tr-behaviour taproot/<slug>/` — define the first behaviour under this intent
   [B] `/tr-decompose taproot/<slug>/` — decompose the intent into a full behaviour set
   [C] `/tr-review taproot/<slug>/intent.md` — stress-test the spec before building

### Refining an existing intent

1. Read the existing `intent.md` at `path`.

2. Ask what changed: "What needs to be updated — the goal, the stakeholders, the success criteria, or the status?"

3. Apply changes, preserving all sections. Update "Last reviewed" to today's date.
   **Preserve the `## Behaviours <!-- taproot-managed -->` section exactly** — read and re-insert it unchanged before `## Status` after applying other edits. Never discard it during a rewrite.

4. If the status is changing to `achieved`, verify at least one success criterion is checked off.

5. Run `taproot validate-format --path <parent-of-path>`.

6. Report what changed.

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

   **What's next?**
   [A] `/tr-behaviour <path>/` — add or refine a behaviour under this intent
   [B] `/tr-review <path>/intent.md` — stress-test the updated intent
   [C] `/tr-status` — see overall project health

## Output

A new `intent.md` in `taproot/<slug>/intent.md` (create mode), or an updated `intent.md` in place (refine mode).

## CLI Dependencies

- `taproot validate-format`

## Document Format Reference

```markdown
# Intent: <Title>

## Stakeholders
- <Role>: <Name or team> — <their interest in this intent>

## Goal
<1-3 sentences describing the desired outcome from the stakeholder's perspective>

## Success Criteria
- [ ] <Measurable criterion 1>
- [ ] <Measurable criterion 2>

## Constraints
- <Constraint 1 (regulatory, technical, timeline, etc.)>

## Status
- **State:** draft | active | achieved | deprecated
- **Created:** <YYYY-MM-DD>
- **Last reviewed:** <YYYY-MM-DD>

## Notes
<Free-form context, links to external docs, meeting notes, etc.>
```
