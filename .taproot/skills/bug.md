# Skill: bug

## Description

Diagnose a defect through structured root cause analysis (5-Why) and delegate to the right fix skill. Invoked directly with a symptom, or handed off from `/tr-ineed` when bug-shaped language is detected.

## Inputs

- `symptom` (required): Description of the observed defect — what happened, what was expected, reproduction steps if known.
- `handoff` (optional): Set to `true` when called by `/tr-ineed` — skips reproduction confirmation.

## Steps

1. **Check for hand-off.** If `handoff` is `true` (invoked from `/tr-ineed`), skip to step 3. Otherwise, proceed to step 2.

2. **Confirm reproducibility.** Ask the actor: "Can you reproduce this consistently? If so, what are the minimal steps?" If the actor cannot reproduce it after clarification (environment details, inputs, frequency, logs), suspend with: "Cannot confirm reproduction — add a failing test case and re-run `/tr-bug` once it's consistent." Stop.

3. **5-Why root cause dialogue.** Ask one "Why?" at a time, building on each answer:

   - "Why did this happen?" → actor identifies the immediate cause
   - "Why did that happen?" → second-order cause
   - Continue until a root cause category can be assigned — **stop as soon as the category is clear.** Do not ask beyond category identification.
   - If no category is clear after 5 iterations, ask directly: "Which of these best describes the root cause: (a) implementation gap — code doesn't match spec, (b) spec gap — spec doesn't cover this case, (c) missing test — behaviour works but has no regression test, (d) external cause — outside the codebase?"

   > 💡 Git history is a useful shortcut: `git log --oneline -- <file>` or `git bisect` can answer "when did this start breaking?" and short-circuit the dialogue for suspected regressions. Suggest this before lengthy analysis.

4. **Classify the root cause.** Assign one category:
   - **Implementation gap** — code does not match spec
   - **Spec gap** — spec does not cover this scenario
   - **Missing test** — behaviour works but has no test catching this regression
   - **External cause** — dependency, environment, or configuration outside the hierarchy
   - If categories overlap, use this priority: **Spec gap > Implementation gap > Missing test**

4a. **Recurrence check.** Ask: *"Could this class of bug happen again — is there a missing gate or outdated guideline that would prevent it?"*

   - **No (clearly one-off** — typo, isolated misconfiguration, external incident): note this and continue to step 5.
   - **Yes**: propose prevention across one or more of:
     - A new DoR or DoD condition to add to `taproot/settings.yaml`
     - An update to `docs/architecture.md`, `docs/security.md`, or `docs/patterns.md`

   If a satisfactory measure is found: present it — e.g. *"I'll add `check-if-affected-by: <gate>` to `taproot/settings.yaml`"* or *"I'll add to `docs/security.md`: `<constraint>`"* — and wait for actor confirmation.
   - On **confirm**: apply the change, then continue to step 5.
   - On **reject**: record the recurrence concern in the implicated impl.md `## Notes` and continue to step 5.

   If no satisfactory measure can be identified: invoke `/tr-grill-me` seeded with *"How do we prevent `<root-cause>` from recurring?"* — incorporate the answer and apply it before continuing to step 5.

5. **Locate the implicated artifact.** Use reverse lookup:
   - Scan all `impl.md` files in `taproot/` for `## Source Files` entries matching the files involved in the root cause
   - If a match is found: that impl.md is implicated
   - If no match: read `taproot/OVERVIEW.md` to identify the closest matching behaviour, then ask the actor: "Is `<path>` the right impl to target?"
   - If the failing behaviour has no impl.md or usecase.md at all: "This behaviour isn't in the hierarchy yet." Delegate to `/tr-ineed` to place it, then return to step 6.

6. **Propose fix approach.** Present a concrete fix hypothesis matched to the root cause type. Ask: "Does this fix approach look right?" Wait for confirmation.

7. **Delegate.**
   - **Spec gap** → `/tr-refine <usecase-path>`
   - **Implementation gap** or **Missing test** →
     - If the impl.md state is `complete`: present — "I'll mark `<impl-path>` as `needs-rework` before proceeding. Confirm?" — update `**State:**` to `needs-rework` on confirmation
     - Then: `/tr-implement <impl-path>`
   - **Multiple root causes** (two independent causes found): list both, ask "Which should we fix first?", note the deferred one in the impl.md, proceed with the chosen one
   - **External cause**: present proposed note ("I'll add this finding to `<impl-path>` ## Notes: [text]"), wait for confirmation, write on confirm

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

**What's next?**
Delegated to `/tr-refine` or `/tr-implement` above.

## Output

- Root cause identified and classified
- Implicated impl.md or usecase.md named
- Fix approach confirmed by actor
- Delegated to `/tr-implement` or `/tr-refine`

## CLI Dependencies

- `taproot overview` (for OVERVIEW.md fallback in step 5)

## Notes

- The 5-Why is a dialogue, not an interrogation. Stop asking as soon as the category is clear — over-asking produces over-engineered root causes.
- When the root cause is a spec gap, fix the spec first before touching code. Implementing against a wrong spec produces wrong code.
- tr-ineed hand-off: `/tr-ineed` should detect bug-shaped language ("it's broken", "wrong output", "this crashes") and call `/tr-bug` with `handoff: true`. Until tr-ineed is updated, actors invoke `/tr-bug` directly.
