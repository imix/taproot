# Skill: grill-me

## Description

Interview the user relentlessly about a plan or design, resolving each decision branch with a recommendation until shared understanding is reached.

Based on Matt Pocock's `grill-me` skill (MIT licensed, https://github.com/mattpocock/skills/blob/main/grill-me/SKILL.md).

## Inputs

- `plan` (required): The plan, design decision, or concept to explore. Can be a few words or a paragraph — the skill will sharpen it.

## Steps

1. Identify the key decision branches in the plan — the points where different choices lead to meaningfully different outcomes. These become the agenda for the session. If the plan relates to an existing taproot artefact, read the relevant `usecase.md` or `intent.md` now (and `taproot/OVERVIEW.md` if you need the broader hierarchy context).

3. For each unresolved branch, in dependency order:

   a. **Ask the question** — one question at a time, never more
   b. **Immediately provide your recommended answer** — the developer should react to your recommendation, not start from scratch. Say: "My recommendation: [answer]. What do you think?"
   c. If the question can be answered by exploring the codebase or hierarchy, do that instead of asking. Present what you found: "I checked `<path>` — it already handles X, so this resolves to Y."
   d. When the developer responds: accept, refine, or push back on their answer. If their answer is vague or incomplete, probe once more before marking the branch resolved.
   e. Mark the branch resolved and move to the next.

4. Continue until all identified branches are resolved or explicitly deferred (developer says "skip this for now" — mark it deferred with their reason).

5. If the plan is too vague to extract decision branches, ask one grounding question first: "What specifically are you trying to decide? What outcome are you aiming for?" Then proceed from step 2.

6. Present a decision synthesis:

   ```
   ## Decisions resolved
   - [branch]: [chosen path] — [reason]

   ## Deferred
   - [branch]: deferred — [reason / what would trigger revisiting]

   ## Constraints surfaced
   - [constraint or risk that emerged]
   ```

   Then present next steps:

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

   **What's next?**
   [A] `/tr-ineed "<clarified requirement>"` — route the sharpened requirement into the hierarchy
   [B] `/tr-behaviour <path>/` — write the spec now that the design is clear
   [C] `/tr-backlog <deferred question>` — capture an unresolved question for later without routing it now

## Output

A structured decision synthesis with every branch resolved or explicitly deferred, and a recommended next action. When called from another skill (embedded mode), the synthesis is passed back to the calling skill as structured input rather than presented as a standalone report.

## CLI Dependencies

None — pure agent skill.

## Notes

- **"Relentless"** means the agent does not drop a branch because the developer gives a short answer. Push until the branch is genuinely resolved or explicitly deferred with a stated reason.
- **Always recommend first.** The session is a dialogue about recommendations, not a blank-slate interview. Developers can agree, refine, or reject — but they should never have to start from scratch.
- **One question at a time.** Batching questions lets the developer give vague omnibus answers. One question forces a specific answer on each branch.
- **Explore the codebase proactively.** Many questions about existing behaviour, architecture, or conventions can be answered by reading files — do this instead of asking.
- **Distinction from `/taproot:review`** (formerly `tr-grill`): `tr-review` stress-tests a finished taproot artefact from an adversarial reviewer's perspective. `tr-grill-me` interviews the developer *before* the artefact is written, to sharpen the thinking that goes into it.
- **Called by other skills:** `/taproot:ineed` delegates to `grill-me` on the "Go deeper [A]" path. When called in embedded mode, output the synthesis summary to the calling skill context rather than presenting it to the user.
