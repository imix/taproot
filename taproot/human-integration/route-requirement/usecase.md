# UseCase: Route a Natural Language Requirement

## Actor
Human orchestrator / developer stating a requirement in natural language — at any level of clarity, from vague instinct to fully-formed specification

## Preconditions
- A taproot hierarchy exists (or can be initialised)
- The developer has a requirement in mind — at any level of detail

## Main Flow
_(Fast path: requirement is clear, concrete, and immediately placeable)_

1. Developer states a requirement in natural language, either:
   - Explicitly: invokes `/tr-ineed` with the requirement as the argument
   - Conversationally: says something the agent detects as a requirement statement ("we also need...", "the system should...", "I want users to be able to...")
2. Agent acknowledges the requirement and classifies it:
   - **Quick** (clear actor, clear goal, unambiguous outcome) → proceed directly to step 3
   - **Substantive** (vague, new domain, significant new capability, or unclear success criteria) → enter structured discovery (see Alternate Flow: Structured Discovery)
3. Agent reads the existing hierarchy (`taproot/OVERVIEW.md` or walks the hierarchy directly) and checks for near-duplicates
4. Agent searches for the best-fit parent intent by matching the requirement's domain and goal against existing intents
5. Agent presents proposed placement with reasoning:
   > "This sounds like it belongs under **`<intent-slug>`** (*`<intent goal>`*) as a new behaviour. Does that feel right?"
6. Developer confirms the proposed placement
7. Agent calls the appropriate skill for the confirmed level:
   - **New intent needed**: calls `/tr-intent` to define a new top-level business goal
   - **New behaviour under existing intent**: calls `/tr-behaviour` on the matched intent
   - **New sub-behaviour**: calls `/tr-behaviour` on the matched parent behaviour
8. The skill guides the developer through the full document, and a new `intent.md` or `usecase.md` is written

## Alternate Flows

### Structured discovery (substantive or vague requirement)
- **Trigger:** Requirement is broad, vague, in a new domain, or lacks clear success criteria — or the developer wants to think it through before committing to the hierarchy
- **Steps:**
  1. Agent opens as a facilitator, not a router: "Before I place this, let me make sure I understand it. I'll ask a few questions."

  **Phase 1 — Problem exploration:**
  2. Agent asks (one at a time, building on answers):
     - "What triggered this need right now — is there a specific incident, user complaint, or gap that surfaced it?"
     - "Who is blocked or frustrated without this? What do they do instead today?"
     - "What happens if this is never built — what's the real cost of the status quo?"

  **Phase 2 — Actor and persona:**
  3. Agent grounds the requirement in a specific user:
     - "Walk me through a specific person who would use this. What's their role and what are they trying to accomplish?"
     - "Is there more than one type of user involved, with different needs?"

  **Phase 3 — Success criteria:**
  4. Agent elicits concrete, observable outcomes:
     - "Give me 2–3 scenarios where this requirement is fully satisfied. Walk me through what happens in each."
     - "How would you demonstrate this is solved — what would you show in a demo or test?"
     - "What's the earliest, smallest version that would deliver real value?"

  **Phase 4 — Scope boundary:**
  5. Agent establishes what's explicitly deferred:
     - "What's out of scope for now — what would you push to a later version?"
     - "Are there edge cases you'd consciously defer?"

  **Phase 5 — Synthesis and confirmation:**
  6. Agent synthesises everything into a structured summary:
     > "Here's what I understood:
     > **Actor:** [specific user persona]
     > **Need:** [concrete capability]
     > **So that:** [observable outcome]
     > **Success looks like:** [scenario 1], [scenario 2], [scenario 3]
     > **Out of scope:** [deferred items]
     >
     > Does that capture it? [A] Go deeper — [C] Continue to placement"
  7. If **[A]**: agent applies advanced elicitation — stress-tests assumptions, explores edge cases, challenges scope from MVP perspective, or considers alternative approaches — then returns to synthesis
  8. If **[C]**: agent proceeds from Main Flow step 3 with the synthesised requirement as context

### No suitable parent intent exists
- **Trigger:** Requirement doesn't map to any existing intent
- **Steps:**
  1. Agent proposes: "This doesn't clearly fit any existing intent — it may need a new one. I'd name it `<proposed-slug>` — *`<proposed goal>`*. Agree?"
  2. Developer confirms or adjusts
  3. Agent calls `/tr-intent` to define the new intent, then `/tr-behaviour` under it

### Near-duplicate detected
- **Trigger:** An existing behaviour or intent closely matches the stated requirement
- **Steps:**
  1. Agent surfaces the existing document: "There's already a behaviour `<path>` that covers `<summary>`. Is your requirement the same, a refinement, or a distinct addition?"
  2. If same → agent links to existing document and stops
  3. If refinement → agent calls `/tr-refine` on the existing usecase
  4. If distinct → agent continues with placement as a new sibling

### Requirement is ambiguous across multiple intents
- **Trigger:** Agent identifies two or more intents that could plausibly own this requirement
- **Steps:**
  1. Agent names the candidates and uses a grill-style question to resolve the ambiguity:
     - "Who is the primary stakeholder — an end user, an operator, or a developer?"
     - "If this was removed, which intent's success criteria would be most affected?"
     - "Is this really one requirement or two that happen to arrive together?"
  2. Developer answers; agent re-proposes placement based on the answer
  3. Proceed from Main Flow step 5

### Developer disagrees with proposed placement
- **Trigger:** Developer says the proposed intent/parent is wrong
- **Steps:**
  1. Agent asks: "Which intent feels like the right home? Or should this be a new intent entirely?"
  2. Developer names or describes the right parent
  3. Agent confirms and proceeds from Main Flow step 7

### Conversational detection
- **Trigger:** Developer mentions a requirement casually without invoking `/tr-ineed`
- **Steps:**
  1. Agent detects the requirement statement and asks: "Should I add that to the taproot hierarchy?"
  2. Developer confirms
  3. Agent proceeds from Main Flow step 2 with the detected statement

## Postconditions
- A new `intent.md`, `usecase.md`, or both exists in the hierarchy at the confirmed location
- The placement was confirmed by the developer before writing
- For substantive requirements: a synthesis summary was confirmed before placement, making the resulting behaviour document richer and more grounded
- The new document is validated by `taproot validate-structure` and `taproot validate-format`

## Error Conditions
- **Requirement spans multiple intents**: Agent flags this and recommends splitting into separate requirements, one per intent
- **No hierarchy exists yet**: Agent offers to run `taproot init` first, then proceeds with placement
- **Discovery reveals contradictory requirements**: Agent surfaces the contradiction and asks the developer to resolve it before placement

## Flow
```mermaid
flowchart TD
    A[Developer states requirement] --> B{Classify}
    B -- Quick: clear actor+goal --> C[Search hierarchy for near-duplicates]
    B -- Substantive: vague/new domain --> D[Structured discovery: problem → persona → success criteria → scope]
    D --> E[Synthesise & confirm with developer]
    E -- Go deeper --> D
    E -- Continue --> C
    C --> F{Find parent intent}
    F -- Match found --> G[Propose placement]
    F -- No match --> H[Propose new intent]
    G --> I{Developer confirms?}
    I -- Yes --> J[Call /tr-intent or /tr-behaviour]
    I -- No --> K[Developer names correct parent] --> J
    H --> J
    J --> L[New intent.md or usecase.md written]
```

## Related
- `taproot/human-integration/grill-me/usecase.md` — structured discovery delegates to grill-me for advanced elicitation

## Implementations <!-- taproot-managed -->
- [Agent Skill — /tr-ineed](./agent-skill/impl.md)


## Status
- **State:** implemented
- **Created:** 2026-03-19
- **Last reviewed:** 2026-03-19

## Notes
- The fast path (Main Flow) is for requirements that are already clear and concrete — skip discovery when the actor, goal, and success criteria are unambiguous
- The structured discovery flow is inspired by BMAD's product brief elicitation: problem first, persona second, success criteria third, scope boundary fourth, synthesis last
- Advanced elicitation (option [A] in synthesis step) includes: stress-testing assumptions, exploring edge cases, challenging scope from MVP perspective, considering alternative approaches, and pre-mortem analysis ("what would make this fail?")
- The synthesised summary from discovery becomes the input to `/tr-behaviour`, producing richer behaviour specs than a raw one-liner requirement statement
- The conversational detection trigger requires the agent to be watching for requirement language — this is a Claude Code behaviour, not a CLI capability
- `/tr-ineed` is the Claude Code adapter command name for this skill
