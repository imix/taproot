# Skill: explore

## Description

Collaborative requirement exploration — think through a vague idea before speccing it; asks one focused question at a time across four angles and hands off to the right taproot skill when you're ready.

## Inputs

- `idea` (required): Rough description of the concept, problem, or feature to explore. Can be a few words or a paragraph — the skill works with whatever you have.

## Steps

0. **Hierarchy check** — scan `taproot/OVERVIEW.md` (or walk `taproot/` if OVERVIEW absent) for any existing spec that closely matches the stated idea. If a near-match is found, surface it before proceeding:

   > "This sounds like it may already be specced at `<abbreviated-path>`. Want to review or refine it instead?"
   > **[A]** Review existing spec — `/tr-browse <path>`
   > **[B]** Continue exploring — the idea is distinct

   If **[B]** or no match: proceed to step 1.

1. **Opening framing** — respond with 1–2 sentences confirming what you heard. Do not add assumptions, ask questions, or expand the idea — just reflect it back to establish a shared starting point.

   Example: *"You're thinking about [core concept] — a way to [rough goal] for [rough actor]. Let's explore it."*

2. **Exploration loop** — ask one focused question at a time. The agent tracks which angles have been covered and avoids asking from the same angle consecutively. Covering all four angles is the target, but order is at the agent's discretion.

   **Angles:**
   - **Problem framing** — who benefits? what problem does this actually solve? what happens if it's never built?
   - **Scope** — what's the simplest version? what's explicitly out? what would you defer to a later version?
   - **Trade-offs** — what are the downsides? what does this cost (complexity, time, user burden)?
   - **Unconsidered angles** — related ideas worth naming, edge cases the developer may not have considered, alternatives to the current framing

3. **Developer responds** — no required format, no fields to fill. Conversational answers are fine.

4. **Build on the response** — the agent follows up when the developer's response introduces new detail worth deepening; shifts to a new angle when the current angle is exhausted or the developer's response is brief and closed.

5. Repeat steps 2–4 until one of the following:
   - Developer signals readiness: *"I think I've got it"*, *"let's spec this"*, *"what next?"*, or `[D] Done`
   - All four angles have been addressed at the agent's discretion
   - **Exploration stalls**: if more than 8 questions have been asked with no convergence toward a clear idea, prompt:
     > "We've covered a lot of ground. Want to stop here and review what we've found, or keep exploring one more angle?"
     > **[D]** Stop and summarise · **[A]** One more angle

6. **Closing summary** — before making any hand-off recommendation, deliver:
   - Core idea in one sentence
   - Key trade-offs surfaced
   - Open questions remaining (or "None identified")

7. **Next skill** — suggest the most appropriate next step based on what emerged:

   - A new intent was identified → `/tr-intent`
   - A specific behaviour under an existing intent → `/tr-behaviour`
   - The idea needs stress-testing before speccing → `/tr-grill-me`
   - Small and clearly scoped — ready to implement → `/tr-implement`
   - The idea turned out to be a fact, rule, or convention → `/tr-define-truth`

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

   **What's next?**
   [1] `/tr-intent` — new intent identified
   [2] `/tr-behaviour <path>/` — clear behaviour under an existing intent
   [3] `/tr-grill-me` — stress-test the idea before speccing
   [4] `/tr-define-truth` — idea is a fact, rule, or convention

## Alternate Flows

### Bundled ideas
- **Trigger:** Developer's opening contains two or more distinct ideas.
- **Steps:**
  1. Name the ideas detected: *"I'm hearing two separate things here: X and Y."*
  2. Ask which to explore first.
  3. Note the rest: *"We can explore the others after."*
  4. When the first idea reaches closing summary, offer to explore the next.

### Developer already has a strong opinion
- **Trigger:** Developer's description is confident rather than exploratory.
- **Steps:**
  1. Acknowledge and confirm the framing.
  2. Rather than leading discovery, explore the opinion from multiple angles: *"What's the strongest argument against this?"*, *"What has to be true for this to work?"*
  3. If challenge reveals the position is undermined, name the issue: *"Based on what we've explored, the original position may not hold because [reason]. Want to adjust the direction before we summarise?"* Then continue to the closing summary with the revised framing.

### Developer wants to stop early
- **Trigger:** Developer signals `[D]` or says *"that's enough"* / *"I've heard enough"*.
- **Steps:**
  1. Skip remaining exploration.
  2. Deliver the closing summary (step 6) based on what has been covered so far.
  3. Offer the same next-skill menu.

### Idea turns out to be a bug
- **Trigger:** Exploration reveals the idea describes broken existing behaviour rather than something new.
- **Steps:**
  1. Flag the pivot: *"This sounds like a defect in existing behaviour rather than a new requirement."*
  2. Redirect: `/tr-bug` with a summary of what was established.

## Output

A closing summary (core idea, trade-offs, open questions) and a recommended next taproot skill. No files are written by this skill — it is a pure thinking-partner session.

## CLI Dependencies

None — pure agent skill.

## Notes

- **One question at a time.** Never ask a list of questions. Batching invites vague omnibus answers; single questions force a specific response on each angle.
- **Confirm before expanding.** The opening framing (step 1) is a reflection, not an expansion. Do not add assumptions or infer goals the developer hasn't stated.
- **Angle tracking is internal.** The agent does not narrate which angle it's on — it just tracks coverage silently and rotates naturally.
- **Follow-up vs. shift.** Follow up when the response opens a new thread worth pulling; shift when the response is closed or brief. Avoid staying on one angle for more than two consecutive turns unless the developer is clearly going deep.
- **Closing summary before hand-off is mandatory.** AC-3 requires the summary to appear before the next-skill suggestion — never skip it, even if the developer signals readiness abruptly.
- **Abbreviated paths in output.** Strip `taproot/specs/` prefix and `.md` extension from any hierarchy paths shown in prompts or output. Full paths for CLI invocations only.
- **Bug pivot exits exploration.** Once the pivot to `/tr-bug` is made, do not return to the exploration loop.
