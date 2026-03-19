# Skill: ineed

## Description

Route a natural language requirement to the right place in the taproot hierarchy. Accepts an explicit requirement statement or detects one conversationally, finds the best-fit parent intent, deduplicates against existing behaviours, resolves ambiguity with grill-style questions, confirms placement with the developer, then calls the appropriate skill to define the new artifact.

## Inputs

- `requirement` (required): Natural language description of what the system needs to do. Can be vague — the skill will sharpen it.

## Steps

1. **Read the hierarchy.** Load `taproot/OVERVIEW.md` if it exists. If not, walk `taproot/` directly and read each `intent.md` found. Build a mental map of: intent slug → goal summary → existing behaviour slugs.

2. **Sharpen vague requirements.** If the requirement is too broad to place (e.g. "make it better", "improve onboarding", "the system should be faster"), ask up to three sharpening questions before proceeding:
   - "Who specifically needs this — end user, operator, or developer?"
   - "What would 'done' look like? How would you know this requirement is met?"
   - "Is there a specific flow or interaction you have in mind?"
   Re-evaluate after each answer. Continue once the requirement is concrete enough to match against an intent.

3. **Search for near-duplicates.** Scan existing `usecase.md` files under `taproot/`. If a behaviour closely matches the stated requirement, surface it:
   > "There's already a behaviour `<path>` that covers `<summary>`. Is your requirement the same, a refinement, or a distinct addition?"
   - **Same** → link to existing document and stop.
   - **Refinement** → call `/taproot:refine <path>` and stop.
   - **Distinct** → continue with placement as a new sibling.

4. **Find the best-fit parent.** Match the requirement's domain and goal against existing intents. Consider:
   - Which intent's goal would be incomplete without this requirement?
   - Which stakeholders are affected — do they match an existing intent's stakeholders?
   - Is this really a new top-level business goal (needs a new intent) or a behaviour under an existing one?

5. **Resolve ambiguity.** If two or more intents could plausibly own this requirement, ask grill-style questions to resolve:
   - "Who is the primary stakeholder — an end user, an operator, or a developer?"
   - "If this was removed, which intent's success criteria would be most affected?"
   - "Is this really one requirement or two requirements that happen to arrive together?"
   Re-propose placement after each answer.

6. **Propose placement with reasoning.** State your proposed location clearly:
   > "This sounds like it belongs under **`<intent-slug>`** (*`<intent goal>`*) as a new behaviour. Does that feel right?"

   If no suitable parent exists:
   > "This doesn't clearly fit any existing intent — it may need a new one. I'd name it `<proposed-slug>` — *`<proposed goal>`*. Agree?"

7. **Handle disagreement.** If the developer rejects the proposed placement, ask:
   > "Which intent feels like the right home? Or should this be a new intent entirely?"
   Re-propose based on their answer.

8. **Confirm and delegate.** Once the developer confirms placement, call the appropriate skill:
   - **New top-level intent needed**: call `/taproot:intent` with the proposed slug and description, then call `/taproot:behaviour` under the new intent.
   - **New behaviour under existing intent**: call `/taproot:behaviour <taproot/<intent-slug>/> "<requirement>"`.
   - **New sub-behaviour under existing behaviour**: call `/taproot:behaviour <taproot/<intent-slug>/<behaviour-slug>/> "<requirement>"`.

## Output

Delegates to `/taproot:intent` and/or `/taproot:behaviour`. No files are written directly by this skill.

## CLI Dependencies

None — this skill delegates all writing to other skills.

## Notes

- This skill is the agent-side implementation of the `human-integration/route-requirement` behaviour.
- The grill questions in Step 5 are the same questions used in `/taproot:grill` for intent-level ambiguity — reuse that logic rather than inventing new questions.
- Conversational detection (detecting a requirement from casual speech without explicit `/tr-ineed` invocation) is a Claude Code behaviour: the agent watches for phrases like "we also need...", "the system should...", "I want users to be able to..." and asks "Should I add that to the taproot hierarchy?" before proceeding.
- `/tr-ineed` is the Claude Code adapter command name for this skill.
