# Skill: behaviour

## Description

Define a UseCase (observable system behaviour) under an intent or another behaviour. Each behaviour is testable, has a clear actor, and describes what the system does — not how it does it.

## Inputs

- `parent` (required): Path to the parent intent folder or parent behaviour folder.
- `description` (required): Natural language description of the behaviour to define.

## Steps

1. Read the parent artifact at `parent`:
   - If `parent` contains `intent.md`: read the intent to understand the goal and success criteria.
   - If `parent` contains `usecase.md`: read the parent behaviour — this new behaviour is a sub-behaviour.

2. Read all sibling `usecase.md` files (other behaviours already under the same parent). Identify any overlap with the described behaviour and flag it: "There's an existing behaviour `<slug>` that covers X — should this new behaviour focus on Y specifically?"

3. Ask clarifying questions through dialogue until you have enough to write the full UseCase. Minimum required:
   - Who or what initiates this behaviour? (the Actor)
   - What must be true before this can happen? (Preconditions)
   - Walk me through the main steps — what does the user/system do, and what does the system respond?
   - What's true when it succeeds? (Postconditions)
   - What can go wrong, and how should the system respond? (Error Conditions)

4. Identify alternate flows proactively — don't just ask for them:
   - "What if the user already has an account?" → Alternate Flow: Existing Account
   - "What if the session expires mid-way?" → Alternate Flow: Session Timeout
   Each alternate flow needs a trigger and its own steps.

5. Draft the `usecase.md`. Write main flow steps as active-voice actions: subject + verb + object. Bad: "The form is submitted." Good: "User submits the registration form."

6. Determine the folder slug: kebab-case, verb-noun or noun phrase (e.g., `register-account`, `reset-password`, `verify-email-address`). Should be distinct from sibling behaviour slugs.

7. Create the directory `<parent>/<slug>/` and write `usecase.md`.

8. Run `taproot validate-structure --path <taproot-root>` and `taproot validate-format --path <parent>/<slug>/`.

9. If the behaviour has clear sub-components, suggest decomposition: "This behaviour has three distinct phases — would you like to break it into sub-behaviours: `<sub-slug-1>`, `<sub-slug-2>`, `<sub-slug-3>`?"

10. Suggest next action: "`/taproot:grill <parent>/<slug>/usecase.md` to stress-test, or `/taproot:implement <parent>/<slug>/` when ready to build."

## Output

A new `usecase.md` in `<parent>/<slug>/usecase.md`.

## CLI Dependencies

- `taproot validate-structure`
- `taproot validate-format`

## Document Format Reference

```markdown
# Behaviour: <Title>

## Actor
<Who or what initiates this behaviour>

## Preconditions
- <What must be true before this behaviour can occur>

## Main Flow
1. <Actor does something>
2. <System responds>
3. <Actor does something>

## Alternate Flows
### <Alternate flow name>
- **Trigger:** <When does this alternate flow occur?>
- **Steps:**
  1. <Step>
  2. <Step>

## Postconditions
- <What is true after successful completion>

## Error Conditions
- <Error scenario>: <Expected system response>

## Status
- **State:** proposed | specified | implemented | tested | deprecated
- **Created:** <YYYY-MM-DD>
- **Last reviewed:** <YYYY-MM-DD>

## Notes
<Edge cases, open questions, links to related behaviours>
```

## Notes

- A behaviour should be completable in one user session. If it spans sessions or days, it is likely multiple behaviours.
- Aim for 3–7 steps in the main flow. Fewer usually means the behaviour is too abstract; more usually means it should be decomposed.
