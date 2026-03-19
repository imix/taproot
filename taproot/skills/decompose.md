# Skill: decompose

## Description

Break an intent down into the set of behaviours (UseCases) needed to fulfill it. Produces a proposed behaviour list tied to each success criterion, then creates the approved `usecase.md` files.

## Inputs

- `path` (required): Path to the intent folder containing `intent.md`.

## Steps

1. Read `<path>/intent.md`. Understand:
   - The goal statement
   - Each success criterion (these are the primary drivers of decomposition)
   - Constraints
   - Any existing notes about expected scope

2. Read any existing behaviour folders under `<path>/`. Note what is already specified to avoid duplicating it.

3. For each success criterion, ask: "What observable system behaviour, when implemented and working, would satisfy this criterion?" Generate candidate behaviours bottom-up from criteria.

4. Add behaviours top-down from the goal: what interaction sequences does an actor need to complete in order for the goal to be considered achieved?

5. Cross-check: for every candidate behaviour, identify which success criterion it serves. If a behaviour doesn't serve any criterion, it is gold-plating — flag it. If a criterion has no behaviour, it is a gap — flag it.

6. Identify dependencies between candidate behaviours (e.g., "verify-email must exist before choose-plan is reachable").

7. Present the proposed decomposition to the user:

```
Proposed behaviours for: <intent-title>

1. register-account
   → Satisfies: "Users can create an account with email and password"
   → Actor: New user
   → Depends on: none

2. verify-email
   → Satisfies: "Email verification is required before access"
   → Actor: System (async), then User (clicking link)
   → Depends on: register-account

3. choose-plan
   → Satisfies: "Users select a subscription plan before access"
   → Actor: User after email verification
   → Depends on: verify-email

Gap: Success criterion "Support <5 second load time" has no behaviour —
     this is a non-functional requirement. Recommend adding it as a constraint
     rather than a behaviour, or creating a behaviour for a specific slow operation.
```

8. Ask: "Which of these should I create? You can say 'all', list specific numbers, or say 'none' to just use this as a planning reference."

9. For each approved behaviour, run `/taproot:behaviour <path> "<description>"` to create the `usecase.md`. Pass enough context from the decomposition (actor, what criterion it satisfies) so the behaviour is well-formed from the start.

10. After all approved behaviours are created, run `taproot validate-structure --path <taproot-root>`.

11. Run `taproot coverage --path <path>` to show the new state.

## Output

A proposed list of behaviours with criterion traceability, then `usecase.md` files for each approved behaviour.

## CLI Dependencies

- `taproot validate-structure`
- `taproot coverage`

## Notes

- Target 3–7 behaviours per intent. Fewer may mean the intent is actually just one behaviour; more may mean the intent is too broad and should be split.
- Non-functional requirements (performance, security, availability) should generally be expressed as constraints in the intent, not as behaviours — unless there is a specific actor interaction that enforces them (e.g., "rate-limit login attempts" is a behaviour; "system must handle 10,000 concurrent users" is a constraint).
- If the intent has sub-intents (other `intent.md` folders nested under it), handle those first — their behaviours may overlap with what this decomposition would propose.
