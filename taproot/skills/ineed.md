# Skill: ineed

## Description

Route a natural language requirement to the right place in the taproot hierarchy. For clear, concrete requirements: deduplicate, find the best parent, confirm placement, delegate to the right skill. For vague or substantive requirements: run a structured discovery session first — problem space, persona, success criteria, scope boundary — then synthesise before routing. The developer leaves with a richer, more grounded requirement, not just a placed one.

## Inputs

- `requirement` (required): Natural language description of what the system needs to do. Can be vague — the skill will sharpen it through discovery.

## Steps

1. **Read the hierarchy** — Load `taproot/OVERVIEW.md` if it exists. If not, walk `taproot/` directly and read each `intent.md`. Build a mental map of: intent slug → goal summary → existing behaviour slugs.

2. **Classify the requirement** — Decide which path to take:

   - **Quick path** (proceed to Step 5): Clear actor, clear goal, unambiguous outcome. The requirement can be matched against the hierarchy without exploration.
   - **Discovery path** (proceed to Step 3): Vague, new domain, significant new capability, or unclear what success looks like. The requirement needs to be understood before it can be placed.

   When in doubt, take the discovery path. A well-understood requirement produces a better behaviour spec.

3. **Structured discovery** (discovery path only) — You are a facilitator, not a content generator. Ask one question at a time, build on answers, and don't move to the next phase until you understand the current one.

   Open: *"Before I place this, let me make sure I understand it properly. A few questions."*

   **Phase 1 — Problem space**

   Ask, building on each answer:
   - "What triggered this need right now — is there a specific incident, user complaint, or gap that surfaced it?"
   - "Who is blocked or frustrated without this? What do they do instead today?"
   - "What happens if this is never built — what's the real cost of not having it?"

   **Phase 2 — Actor and persona**

   Ground the requirement in a specific person:
   - "Walk me through a specific person who would use this. What's their role, and what are they trying to accomplish?"
   - "Is there more than one type of user involved, with meaningfully different needs?"

   **Phase 3 — Success criteria**

   Elicit concrete, observable outcomes — not "what does done look like" but specific scenarios:
   - "Give me 2–3 scenarios where this requirement is fully satisfied. Walk me through what happens in each."
   - "How would you demonstrate this is solved — what would you show in a demo or test?"
   - "What's the earliest, smallest version that would deliver real value?"

   Push back on vague answers: *"users are happy"* → *"users can complete [action] without [current friction]"*

   **Phase 4 — Scope boundary**

   Establish what's explicitly deferred:
   - "What's out of scope for now — what would you push to a later version?"
   - "Are there edge cases you'd consciously defer?"

4. **Synthesise and confirm** (discovery path only) — Produce a structured summary and confirm it before routing:

   > "Here's what I understood:
   > **Actor:** [specific user persona]
   > **Need:** [concrete capability]
   > **So that:** [observable outcome]
   > **Success looks like:** [scenario 1], [scenario 2], [scenario 3]
   > **Out of scope:** [deferred items]
   >
   > Does that capture it?
   > **[A]** Go deeper   **[C]** Continue to placement"

   **If [A] — Advanced elicitation:** Apply one or more of the following, then return to synthesis:
   - *Stress-test assumptions*: "What would have to be true for this requirement to be wrong or unnecessary?"
   - *Edge cases*: "What happens when [user has no data / is offline / does it twice / does it wrong]?"
   - *MVP challenge*: "What's the absolute minimum version that proves this works? What could you cut?"
   - *Alternative approaches*: "Is there a simpler way to solve the underlying problem?"
   - *Pre-mortem*: "Imagine this was built and nobody used it. What would be the most likely reason?"

   **If [C]:** Proceed to Step 5 with the synthesised requirement as context. This summary will carry forward into `/tr-behaviour` as richer input than a raw one-liner.

5. **Search for near-duplicates** — Scan existing `usecase.md` files under `taproot/`. If a behaviour closely matches the stated (or synthesised) requirement, surface it:

   > "There's already a behaviour `<path>` that covers `<summary>`. Is your requirement the same, a refinement, or a distinct addition?"

   - **Same** → link to existing document and stop
   - **Refinement** → call `/taproot:refine <path>` and stop
   - **Distinct** → continue with placement as a new sibling

6. **Find the best-fit parent** — Match the requirement's domain and goal against existing intents. Consider:
   - Which intent's goal would be incomplete without this requirement?
   - Which stakeholders are affected — do they match an existing intent's stakeholders?
   - Is this a new top-level business goal (needs a new intent) or a behaviour under an existing one?

7. **Resolve ambiguity** — If two or more intents could plausibly own this requirement, ask grill-style questions to resolve:
   - "Who is the primary stakeholder — an end user, an operator, or a developer?"
   - "If this was removed, which intent's success criteria would be most affected?"
   - "Is this really one requirement or two that happen to arrive together?"

   Re-propose placement after each answer.

8. **Propose placement with reasoning** — State your proposed location clearly:

   > "This sounds like it belongs under **`<intent-slug>`** (*`<intent goal>`*) as a new behaviour. Does that feel right?"

   If no suitable parent exists:

   > "This doesn't clearly fit any existing intent — it may need a new one. I'd name it `<proposed-slug>` — *`<proposed goal>`*. Agree?"

   If the developer disagrees: "Which intent feels like the right home? Or should this be a new intent entirely?" Re-propose based on their answer.

9. **Confirm and delegate** — Once the developer confirms placement, call the appropriate skill — carrying the synthesised summary (if discovery was run) as context for the behaviour definition:

   - **New top-level intent needed**: call `/taproot:intent` with the proposed slug and description, then call `/taproot:behaviour` under the new intent
   - **New behaviour under existing intent**: call `/taproot:behaviour <taproot/<intent-slug>/> "<synthesised requirement>"`
   - **New sub-behaviour under existing behaviour**: call `/taproot:behaviour <taproot/<intent-slug>/<behaviour-slug>/> "<synthesised requirement>"`

## Output

Delegates to `/taproot:intent` and/or `/taproot:behaviour`. No files are written directly by this skill. For discovery-path requirements, the synthesis summary produced in Step 4 becomes the input context for the delegated skill.

## CLI Dependencies

None — this skill delegates all writing to other skills.

## Notes

- **Fast path vs discovery path**: The fast path is for requirements that are already clear. When in doubt, take the discovery path — a few extra minutes of elicitation produces a behaviour spec that doesn't need to be grilled and refined immediately after.
- **Facilitator mindset**: You are not generating content, you are helping the developer articulate what they already know. Every question should help them think, not just answer.
- **Discovery produces richer specs**: The synthesis summary from Step 4 carries forward into `/taproot:behaviour`, giving it a structured actor, goal, success criteria, and scope boundary to work from — not just a raw one-liner.
- **Advanced elicitation** techniques (pre-mortem, MVP challenge, edge cases, alternative approaches) are the same used in `/taproot:grill` — reuse that framing rather than inventing new questions.
- **Conversational detection**: Detecting a requirement from casual speech without explicit `/tr-ineed` invocation is a Claude Code behaviour — the agent watches for phrases like "we also need...", "the system should...", "I want users to be able to..." and asks "Should I add that to the taproot hierarchy?" before proceeding.
- `/tr-ineed` is the Claude Code adapter command name for this skill.
