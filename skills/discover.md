# Skill: discover

## Description

Reverse-engineer an existing codebase into a taproot hierarchy through structured, interactive discovery. Interviews the user to surface business intents, identifies behaviours from existing code, and produces `intent.md`, `usecase.md`, and `impl.md` files for what's already built. Heavily interactive — expect multiple rounds of clarification.

## Inputs

- `scope` (optional): A subdirectory or area to focus discovery on. Defaults to the whole project.
- `depth` (optional): `intents-only` (stop after intent documents), `behaviours` (intent + usecase), `full` (intent + usecase + impl). Defaults to `full`.

## Steps

### Phase 0 — Check for Existing Session

1. Before doing anything else, check for `taproot/_brainstorms/discovery-status.md`.

   - **If found**: read it and present a resume prompt:
     > "I found an in-progress discovery session (last updated: [date], phase: [phase]).
     >
     > - **Resume** from where we left off
     > - **Restart** from the beginning (status file will be overwritten)
     > - **Abandon** without changes"

     If resuming: skip to the phase indicated in the status file, treating all items marked `[x]` as already complete. Re-read the Notes section for context carried from the prior session.

   - **If not found**: create it now with Phase set to `1` and proceed.

   Save the status file after every confirmed intent, behaviour, and implementation — not just at the end.

   **Stopping early:** at any point the user can say "stop" or "pause". Before ending the session, update the status file with the current phase and progress, then write a session summary:
   ```
   Session ended.
   Written (<n>): <list of written paths>
   Skipped (<n>): <list of skipped paths>
   Remaining (<n>): <list of remaining paths not yet reached>
   Resume: run /tr-discover and choose Resume.
   ```

   **Auto-proceed:** if the user says "just go", "do all", or invokes with `--auto`, acknowledge once ("Auto-proceeding through remaining items — say 'stop' at any time to pause.") then write all remaining documents without pausing for confirmation. Still report each path as it is written. At the end, show the same completion summary.

### Phase 1 — Orient

2. Read the project root for orientation materials in this order (skip if not found):
   - `README.md` / `README.rst` / `README.txt`
   - `package.json`, `Cargo.toml`, `pyproject.toml`, `go.mod`, or other manifest files (name + description + scripts)
   - `ARCHITECTURE.md`, `DESIGN.md`, `docs/` directory listing
   - Existing `taproot/` directory (note any intents already documented to avoid duplication)

3. Scan the top-level structure: list directories, identify entry points (`main.*`, `index.*`, `cli.*`, `server.*`, `app.*`), note the primary language and framework.

4. Present a one-paragraph orientation to the user:
   > "I can see this is a [language/framework] project that [what it does based on README/manifest]. Before I propose any structure, I want to make sure I understand the **business goals** rather than the technical structure. The folder layout reflects how it was built, not why — and those are often different things."

   Then ask the first discovery question:
   > "In one or two sentences: what problem does this software solve, and who uses it?"

   Wait for the user's answer before continuing.

### Phase 2 — Surface Intents (interactive, one at a time)

5. Based on the user's answer and the codebase scan, form a hypothesis about the top-level business intents. An intent is a **business goal** — not a module, not a command, not a feature flag. Good intents start with verbs: "Enable users to…", "Allow operators to…", "Provide developers with…".

   Common traps to avoid:
   - Don't create an intent per CLI command (those are often all part of one intent)
   - Don't create an intent per file or module (technical decomposition ≠ business intent)
   - Don't create an intent for infrastructure concerns (logging, config loading) unless they are externally visible

5. For each hypothesised intent (present them one at a time, not all at once):

   a. State the candidate intent:
      > "I think one intent might be: **[goal statement]**. This would cover [what code/features I think belong here]."

   b. Ask a probing question about it — pick the most relevant one:
      - "Is this something users directly ask for, or is it a means to an end for a larger goal?"
      - "Who is the primary stakeholder for this — an end user, an operator, or a developer integrating this tool?"
      - "If this intent was removed from the product, who would notice and what would they lose?"
      - "Is [A] and [B] really one intent, or do they serve different stakeholders with different success criteria?"
      - "What does success look like for this intent — how would you know it's working well?"

   c. Refine based on the user's answer. Accept, split, merge, or discard the intent. Only proceed to document confirmed intents.

   d. For each confirmed intent, determine:
      - `slug`: kebab-case identifier
      - `title`: human-readable title
      - `goal`: one sentence, starts with a verb
      - `stakeholders`: who cares about this (with their perspective)
      - `success criteria`: 1–3 measurable outcomes
      - `constraints`: known limitations, non-goals, or boundaries
      - `status`: `active` (it's already built)

   e. Present the proposed `intent.md` to the user before writing:

      ```
      Proposed: taproot/<slug>/intent.md — <title>

      <full proposed content>

      [Y] Write it   [E] Edit before writing   [S] Skip   [Q] Quit session
      ```

      - **[Y]**: write the file, report the path written, proceed to the next intent
      - **[E]**: apply the developer's corrections, re-present the updated proposal with the same menu
      - **[S]**: skip — do not write; note "Skipped `taproot/<slug>/intent.md`" and move on
      - **[Q]**: stop the session immediately and write the session summary (see Phase 0)

   f. Update `taproot/_brainstorms/discovery-status.md`: mark this intent `[x]` in Phase 2, set Phase to `2`, update Last updated.

6. After all intents are confirmed and written, show a summary:
   > "Confirmed [N] intents: [list]. Do any of these feel wrong, or is there a significant area of the system we haven't covered?"

   Incorporate any corrections before moving to Phase 3. Update status file: set Phase to `3`.

### Phase 3 — Discover Behaviours (per intent, interactive)

*Skip this phase if `depth` is `intents-only`.*

7. For each confirmed intent, work through it one at a time:

   a. Read the relevant source files — identify the entry points, public APIs, or user-facing interactions that belong to this intent.

   b. Propose use cases — observable system behaviours from the actor's perspective. A use case is a specific interaction with a clear trigger, flow, and outcome. Name them from the actor's perspective: "User resets password", not "Password reset endpoint".

   c. For each proposed use case, ask:
      - "Does this behaviour have any important alternate flows or error conditions I should know about?"
      - "Is this one behaviour or two? [e.g., if the happy path and the error recovery feel like distinct things]"

   d. Confirm the use case structure with the user, then determine from the existing code:
      - `actor`: who initiates this (User, Operator, System, External service)
      - `preconditions`: what must be true before this can happen
      - `main flow`: numbered steps describing what happens (read from the actual code)
      - `alternate flows`: edge cases the code handles
      - `error conditions`: how the system responds to failures
      - `postconditions`: what's true after the flow completes

   e. Present the proposed `usecase.md` to the user before writing:

      ```
      Proposed: taproot/<intent-slug>/<behaviour-slug>/usecase.md — <behaviour name>

      <full proposed content>

      [Y] Write it   [E] Edit before writing   [S] Skip   [Q] Quit session
      ```

      Apply Y/E/S/Q as described in step 5e above.

   f. Update status file: mark this behaviour `[x]` under its intent in Phase 3, update Last updated.

8. After all behaviours for an intent are written:
   > "I've documented [N] behaviours for [intent]. Anything missing — behaviours the code handles that we didn't capture?"

### Phase 4 — Link Implementations (per behaviour)

*Skip this phase if `depth` is `intents-only` or `behaviours`.*

9. For each confirmed behaviour, identify the implementation:

   a. Find the source files that implement it — be specific, not just the module.

   b. Find relevant tests — look for test files that exercise this behaviour's main flow, alternate flows, and error conditions.

   c. Identify any relevant commits if git history is available: `git log --oneline -- <relevant files> | head -20`

   d. Ask the user one question before writing:
      > "Is the implementation of [behaviour] complete and tested, or are there known gaps?"

      If there are gaps, note them in the `impl.md` Notes section and set Status to `in-progress`. Otherwise `complete`.

   e. Determine the implementation slug (derive from the primary approach: `rest-api`, `cli`, `background-job`, `library`, etc.).

   f. Present the proposed `impl.md` to the user before writing:

      ```
      Proposed: taproot/<intent-slug>/<behaviour-slug>/<impl-slug>/impl.md — <behaviour name>

      <full proposed content>

      [Y] Write it   [E] Edit before writing   [S] Skip   [Q] Quit session
      ```

      Apply Y/E/S/Q as described in step 5e above.

   g. Update status file: mark this impl `[x]` under its behaviour in Phase 4, update Last updated.

10. After each intent's implementations are written, run:
    ```
    taproot validate-structure
    taproot validate-format
    ```
    Fix any validation errors before moving to the next intent. Update status file: set Phase to `4` when starting this phase.

### Phase 5 — Wrap Up

11. Run `taproot coverage` and present the results.

12. Run `taproot check-orphans` to verify nothing is structurally broken.

13. Update status file: set Phase to `complete`, update Last updated.

14. Present a closing summary:
    > "Discovery complete. Documented [N] intents, [N] behaviours, [N] implementations."

    **What's next?**
    [A] `/tr-status` — see coverage gaps and health report
    [B] `/tr-plan` — surface the next behaviour to implement
    [C] `/tr-ineed` — capture requirements that surfaced during discovery but weren't formalised

## Output

- `taproot/_brainstorms/discovery-status.md` — session state, updated continuously
- `taproot/<intent-slug>/intent.md` for each confirmed intent
- `taproot/<intent-slug>/<behaviour-slug>/usecase.md` for each confirmed behaviour
- `taproot/<intent-slug>/<behaviour-slug>/<impl-slug>/impl.md` for each implementation
- All documents reflect existing code and are written with `status: active` / `complete` (or `in-progress` where gaps are noted)

## CLI Dependencies

- `taproot validate-structure`
- `taproot validate-format`
- `taproot coverage`
- `taproot check-orphans`

## Document Formats

### discovery-status.md

```markdown
# Discovery Status

<!-- Managed by /tr-discover — do not edit Phase 2/3/4 checklists manually -->

## Session
- **Started:** <YYYY-MM-DD>
- **Last updated:** <YYYY-MM-DD>
- **Phase:** 1 | 2 | 3 | 4 | 5 | complete
- **Scope:** whole project | <subdirectory>
- **Depth:** full | behaviours | intents-only

## Notes
<!-- Free-form context to carry between sessions: key decisions, open questions, things to revisit -->

## Phase 2 — Intents
<!-- [x] = intent.md written; [ ] = proposed but not yet confirmed -->

## Phase 3 — Behaviours
<!-- One subsection per intent; [x] = usecase.md written -->

## Phase 4 — Implementations
<!-- One subsection per intent/behaviour path; [x] = impl.md written -->
```

### intent.md

```markdown
# Intent: <Title>

## Goal
<One sentence starting with a verb. What business outcome does this enable?>

## Stakeholders
- **<Role>**: <their perspective and what they gain>

## Success Criteria
- <Measurable outcome — observable, not technical>

## Constraints
- <Known non-goals, boundaries, or limitations>

## Status
- **State:** active
- **Created:** <YYYY-MM-DD>
```

### usecase.md

```markdown
# UseCase: <Title>

## Actor
<Who initiates this interaction>

## Preconditions
- <What must be true before this can happen>

## Main Flow
1. <Step — from the actor's perspective>
2. <Step>

## Alternate Flows
- **<Trigger>**: <what happens instead>

## Error Conditions
- **<Error>**: <how the system responds>

## Postconditions
- <What is true after the flow completes>

## Diagram
<!-- Optional: add a Mermaid diagram for complex flows. Omit if the prose is clear enough. -->
```mermaid
sequenceDiagram
  Actor->>System: <trigger>
  System-->>Actor: <response>
```

## Status
- **State:** active
- **Created:** <YYYY-MM-DD>
```

### impl.md

```markdown
# Implementation: <Title>

## Behaviour
../usecase.md

## Design Decisions
- <Non-obvious choice and why it was made>

## Source Files
- `<path/to/file>` — <what this file does for this behaviour>

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `<path/to/test>` — <which scenarios this covers>

## Status
- **State:** complete | in-progress
- **Created:** <YYYY-MM-DD>
- **Last verified:** <YYYY-MM-DD>

## Notes
<Known gaps, technical debt, or deferred error conditions>
```

## Notes

- Discovery is a conversation, not a scan. The code tells you *what* exists; the user tells you *why* it matters. Both are needed.
- Resist the urge to map modules to intents 1:1. A single intent often spans many files; a single file often serves multiple intents.
- When unsure whether something deserves its own intent vs. being a behaviour under another intent, ask: "Would a non-technical stakeholder describe these as separate goals, or as one goal with multiple steps?"
- Existing code may have dead code, vestigial features, or undocumented behaviours. Ask the user before documenting anything that looks unused.
- If the project already has partial taproot coverage, read the existing docs first and only discover what's missing.
- Save the status file eagerly — after every write, not just at phase boundaries. A session interrupted mid-phase should resume at the last confirmed item, not the start of the phase.
- The Notes section of the status file is the memory of the session. Use it to capture decisions, open questions, and anything the user said that isn't captured in a document yet.
