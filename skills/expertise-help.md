# Skill: expertise-help

## Description

Assist when a developer cannot confidently answer a domain question during a skill session — scan the project for evidence, apply domain knowledge, and propose a concrete answer with reasoning and alternatives.

## Inputs

- `question` (optional): The question the developer cannot answer. If omitted, the developer is asked to state it.

## Steps

1. **Establish the question.**

   If `question` was provided as an argument, confirm it:
   > Understood — the question is: **[question]**. I'll scan the project and propose an answer.

   If no argument was given, ask:
   > What is the question you are trying to answer?

   Wait for the developer to state the question before continuing.

2. **Check if the question spans multiple independent sub-decisions.**

   If yes — go to Alternate Flow: Question too broad (below).

3. **Scan project context.** Read the following for evidence directly relevant to the question:
   - `taproot/OVERVIEW.md` (if present) — for project goals and structure
   - `taproot/global-truths/` — for applicable conventions, decisions, and domain facts
   - Existing specs under `taproot/specs/` — for patterns and prior decisions
   - Relevant source files — for conventions already in the code

   Note: if nothing relevant is found, proceed to step 4 with no project evidence to cite.

4. **Synthesise.** Draw on domain knowledge for the question's subject area and combine it with what was found in step 3.

   If the question involves authoritative external sources that cannot be fully verified (jurisdiction-specific legal requirements, current regulatory standards, live third-party pricing) — go to Alternate Flow: External verification required (below).

5. **Present a structured proposal.**

   If project evidence was found:

   > **What the project already shows**
   > [Patterns, conventions, or choices already present in the project relevant to the question — cite specific files or specs]
   >
   > **Draft answer**
   > [A concrete, opinionated recommendation]
   >
   > Reasoning: [One paragraph explaining why this is the right answer, grounded in domain best practice and the project's existing direction]
   >
   > **Alternatives**
   > - [Option A] — [trade-off: what you gain and what you give up]
   > - [Option B] — [trade-off: what you gain and what you give up]
   >
   > **[Y]** Confirm — use this answer   **[A]** Adjust wording   **[R]** Reject — I'll explain what's wrong

   If no project evidence was found:

   > *(No relevant patterns or prior decisions found in this project — the proposal is based on domain best practice only.)*
   >
   > **Draft answer**
   > [A concrete, opinionated recommendation]
   >
   > Reasoning: [One paragraph explaining why this is the right answer]
   >
   > **Alternatives**
   > - [Option A] — [trade-off]
   > - [Option B] — [trade-off]
   >
   > **[Y]** Confirm — use this answer   **[A]** Adjust wording   **[R]** Reject — I'll explain what's wrong

6. **Handle the developer's response.**

   - **[Y] Confirm:** The answer is confirmed. Report:
     > Answer confirmed: [confirmed answer]. Returning to the session.

     If called inline from another skill: return to the calling skill with the confirmed answer — do not show the What's next? block.

     If invoked standalone, present:

     > 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

     **What's next?**
     [1] Return to your session with the confirmed answer in place
     [2] `/tr-backlog <question>` — capture it as a backlog item if you want to revisit
     [3] `/tr-grill-me "<related decision>"` — stress-test the answer if it has downstream design implications

   - **[A] Adjust wording:** Ask the developer to provide their adjusted wording. Once received, confirm it and stop (same What's next? guidance as [Y]).

   - **[R] Reject:** Go to Alternate Flow: Developer rejects the proposal (below).

---

### Alternate Flow: Question too broad

*Trigger: The question spans multiple independent sub-decisions.*

1. Identify the sub-decisions and present them as a numbered list:
   > This question has several independent parts. I'll work through them one at a time:
   >
   > 1. [Sub-decision A]
   > 2. [Sub-decision B]
   > 3. [Sub-decision C]
   >
   > Proposed order: 1 → 2 → 3. **[Y]** Proceed in this order   **[R]** Resequence

2. On **[R]**: ask the developer for their preferred order, then confirm.

3. Run steps 3–6 of the main flow for each sub-decision in sequence.

---

### Alternate Flow: Developer rejects the proposal

*Trigger: Developer selects [R] and cannot articulate an alternative.*

1. Ask one focused follow-up question:
   > What feels off about this proposal? Is it the tone, the scope, the specific recommendation, or something else?

2. Wait for the developer's explanation.

3. Revise the draft answer incorporating the feedback.

4. Return to step 5 of the main flow.

---

### Alternate Flow: External verification required

*Trigger: The question involves jurisdiction-specific legal requirements, current regulatory standards, live third-party pricing, or other authoritative sources the agent cannot fully verify.*

1. Present the proposal with a verification flag:

   > **Draft answer**
   > [Best available answer]
   >
   > Reasoning: [One paragraph]
   >
   > **Alternatives**
   > - [Option A] — [trade-off]
   >
   > ⚠ **Authoritative verification recommended** — this answer is based on general knowledge. Before treating it as a firm decision, verify:
   > - [What to verify]
   > - [Where to look / who to ask]
   >
   > The answer is marked as provisional until verified.
   >
   > **[Y]** Accept as provisional   **[A]** Adjust wording   **[R]** Reject

2. On **[Y]**: confirm the provisional answer and return to the session. Note that it is pending verification.

---

### Error Condition: Question is outside all available knowledge

If the question cannot be addressed even with domain knowledge:

> I cannot propose an answer to this question — [explain what knowledge is missing].
>
> Options:
> - **[P]** Provide the answer yourself now
> - **[D]** Defer this question — continue the session without an answer for now

## Output

A confirmed answer the developer can use in the current skill session, along with the reasoning and any verification notes.

## CLI Dependencies

None — pure agent skill.

## Notes

- This skill is designed to be invoked both directly (when a developer is stuck) and inline from other skills (via a `[H] Get help` option). When called inline, omit the What's next block and return the confirmed answer to the calling skill context.
- Always recommend first. The developer should react to a concrete proposal, not start from scratch.
- Keep the proposal concise — the developer is mid-session. Domain exposition belongs in the reasoning paragraph, not scattered throughout.
- For questions requiring only a quick codebase lookup (e.g. "does the project already use X?"), read the relevant file and answer directly without going through the full proposal flow.
