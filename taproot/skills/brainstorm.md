# Skill: brainstorm

## Description

Explore a vague idea or problem space before committing to a specific intent. Produces a structured brainstorm document with candidate intents. Does **not** create any hierarchy entries — brainstorms are exploratory scratch space.

## Inputs

- `description` (required): Free-form description of the idea, problem, or opportunity to explore.
- `context` (optional): Additional domain context, existing constraints, or related systems.

## Steps

1. Accept the free-form description. If it is very short (under two sentences), ask one clarifying question before proceeding: "What problem does this solve, or what outcome are you trying to achieve?"

2. Map the problem space by asking expansive questions — do not wait for answers, generate your own informed hypotheses, but flag the ones that are genuinely uncertain:
   - **Stakeholders**: Who is affected beyond the obvious primary user? (operations, support, compliance, third-party partners, future users?)
   - **Current workarounds**: How do people solve this problem today? What does that reveal about what matters most?
   - **Adjacent problems**: What related problems exist that this solution might solve or create?
   - **Success perspectives**: What does success look like from each stakeholder's perspective? Are those views in tension?
   - **Existing solutions**: What similar tools, systems, or prior attempts exist? What did they get wrong?
   - **Cost of inaction**: What happens if this is never built? Is the status quo actually acceptable?

3. Generate 2–5 **candidate intents** — specific, bounded goals that emerged from the problem space mapping. For each candidate:
   - Write a one-sentence goal statement
   - Name 1–2 likely stakeholders
   - Identify the single clearest success criterion
   - Flag any obvious risks or open questions

4. Identify the **single recommended starting point**: which candidate intent to pursue first, and why (smallest scope, highest certainty, most blocking dependency, etc.).

5. Determine the brainstorm slug: kebab-case, descriptive (e.g., `onboarding-friction`, `payment-failure-recovery`).

6. Write the brainstorm document to `taproot/_brainstorms/<slug>.md` using this structure:

```markdown
# Brainstorm: <Title>

## Problem Space

<2–4 paragraphs describing the problem, current state, and why it matters>

## Stakeholders Identified

- **<Role>**: <their perspective and interest>

## Candidate Intents

### 1. <Intent title>
- **Goal**: <one sentence>
- **Stakeholders**: <who>
- **Success criterion**: <measurable>
- **Risks/unknowns**: <what's uncertain>

### 2. <Intent title>
...

## Recommended Starting Point

<Which candidate to pursue first and why>

## Open Questions

- <Question that would change the direction if answered>

## Created

<ISO date>
```

7. After writing, tell the user: "Brainstorm saved to `taproot/_brainstorms/<slug>.md`. When you're ready to commit to one of these intents, use `/taproot:intent` with a description, or I can convert the recommended candidate directly."

## Output

A brainstorm document at `taproot/_brainstorms/<slug>.md`. No `intent.md`, `usecase.md`, or `impl.md` files are created.

## CLI Dependencies

None — brainstorms are outside the validated hierarchy.

## Notes

- If the user already has a brainstorm and wants to stress-test it before proceeding, suggest `/taproot:grill taproot/_brainstorms/<slug>.md`.
- If the user is ready to commit to an intent immediately (they already know what they want), skip brainstorm and go directly to `/taproot:intent`.
