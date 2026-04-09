# Behaviour: Requirement Exploration

## Actor
Developer with a vague idea, problem statement, or feature concept not yet ready to spec

## Preconditions
- Developer has an idea worth exploring — however rough or undefined

## Main Flow
1. Developer invokes `/tr-explore` with a rough description of their idea.
2. Agent opens with a 1–2 sentence framing of what it heard — confirming the starting point without adding assumptions.
3. Agent asks one focused question to deepen understanding. The agent tracks which angles have been covered and avoids asking from the same angle consecutively. Covering all four angles is the target, but order is at the agent's discretion. Angles:
   - **Problem framing**: who benefits? what problem does this actually solve?
   - **Scope**: what's the simplest version? what's explicitly out?
   - **Trade-offs**: what are the downsides? what does this cost?
   - **Angles the developer may not have considered**: related ideas, edge cases, alternatives worth naming
4. Developer responds conversationally — no required format, no fields to fill.
5. Agent builds on the response: asks a follow-up when the developer's response introduces new detail worth deepening; shifts to a new angle when the current angle is exhausted or the developer's response is brief and closed.
6. Steps 3–5 repeat until the developer signals readiness (e.g. "I think I've got it", "let's spec this", "what next?") or the agent judges the idea sufficiently explored — defined as at least one question drawn from each of the four angles in step 3, or all four angles addressed at the agent's discretion.
7. Agent delivers a brief closing summary:
   - Core idea in one sentence
   - Key trade-offs surfaced
   - Open questions remaining
8. Agent suggests the most appropriate next skill based on what emerged:
   - Idea needs a new intent → `/tr-intent`
   - A clear behaviour is emerging under an existing intent → `/tr-behaviour`
   - The idea needs stress-testing before speccing → `/tr-grill-me`
   - Small and clear enough to implement directly → `/tr-implement`
   - The idea turned out to be a fact, rule, or convention → `/tr-define-truth`

## Alternate Flows
### Developer has multiple bundled ideas
- **Trigger:** Developer's opening description contains several distinct ideas.
- **Steps:**
  1. Agent names the ideas it detected: "I'm hearing two separate things here: X and Y."
  2. Agent asks which to explore first.
  3. Remaining ideas are noted: "We can explore the others after."

### Developer already has a strong opinion
- **Trigger:** Developer's description is confident rather than exploratory.
- **Steps:**
  1. Agent acknowledges the position and confirms the framing.
  2. Rather than leading discovery, agent explores the opinion from multiple angles: "What's the strongest argument against this?", "What has to be true for this to work?"
  3. If challenge reveals the position is undermined, agent names the issue: "Based on what we've explored, the original position may not hold because [reason]. Want to adjust the direction before we summarise?" Then continues to the closing summary with the revised framing.

### Developer wants to stop early
- **Trigger:** Developer signals they've heard enough or want to move on.
- **Steps:**
  1. Agent skips remaining exploration and goes directly to the closing summary (step 7).
  2. Agent offers the same next-skill menu.

### Idea turns out to be a bug
- **Trigger:** Exploration reveals the idea is describing broken existing behaviour rather than something new.
- **Steps:**
  1. Agent flags the pivot: "This sounds like a defect in existing behaviour rather than a new requirement."
  2. Agent redirects to `/tr-bug` with a summary of what was established.

## Postconditions
- The developer's idea is articulated in concrete terms — core concept, trade-offs, and open questions — captured in the agent's closing summary
- Key trade-offs and open questions are named
- The appropriate next taproot skill is identified and ready to invoke

## Error Conditions
- **Idea is already captured in the hierarchy**: Agent points to the existing spec rather than re-exploring it — "This sounds like it's already specced at `<path>`. Want to review or refine it instead?"
- **Exploration stalls**: if the agent has asked more than 8 questions with no convergence toward a clear idea, it prompts: "We've covered a lot of ground. Want to stop here and review what we've found, or keep exploring one more angle?"

## Flow
```mermaid
flowchart TD
    A[Developer invokes /tr-explore with rough idea] --> B[Agent frames what it heard — 1-2 sentences]
    B --> C[Agent asks one focused question]
    C --> D[Developer responds]
    D --> E{Developer signals ready?}
    E -- No --> F{Multiple bundled ideas?}
    F -- Yes --> G[Name ideas, ask which to explore first]
    G --> C
    F -- No --> C
    E -- Yes --> H[Agent delivers closing summary]
    H --> I{What emerged?}
    I -- New intent needed --> J[/tr-intent]
    I -- Clear behaviour --> K[/tr-behaviour]
    I -- Needs stress-test --> L[/tr-grill-me]
    I -- Small and clear --> M[/tr-implement]
    I -- Fact or rule --> N[/tr-define-truth]
```

## Related
- `./grill-me/usecase.md` — adversarial complement: stress-tests a position you already hold; commonly invoked after exploration
- `./route-requirement/usecase.md` — routes a requirement that is already understood; exploration precedes routing for vague ideas
- `../agent-integration/autonomous-execution/usecase.md` — shares actor; exploration is a human-led, agent-assisted session

## Acceptance Criteria

**AC-1: One question per turn**
- Given the developer has provided their idea
- When the agent responds
- Then the agent asks exactly one focused question — not a list of questions

**AC-2: Opening framing before first question**
- Given the developer invokes `/tr-explore`
- When the agent responds for the first time
- Then the agent opens with a 1–2 sentence framing of what it heard before asking its first question

**AC-3: Closing summary before hand-off**
- Given the developer signals readiness
- When the agent closes the exploration
- Then the agent delivers a summary (core idea, trade-offs, open questions) before suggesting the next skill

**AC-4: Correct skill routing**
- Given exploration has completed
- When the agent makes its hand-off recommendation
- Then: a new intent was identified → `/tr-intent`; a specific behaviour under an existing intent → `/tr-behaviour`; the idea needs stress-testing before speccing → `/tr-grill-me`; the idea is small and clearly scoped → `/tr-implement`; the idea is a fact, rule, or convention → `/tr-define-truth`

**AC-5: Bundled ideas separated**
- Given the developer's opening contains two or more distinct ideas
- When the agent responds
- Then the agent names the distinct ideas and asks which to explore first before proceeding

## Status
- **State:** specified
- **Created:** 2026-04-09
- **Last reviewed:** 2026-04-09
