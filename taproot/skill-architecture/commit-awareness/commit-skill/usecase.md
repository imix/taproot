# Behaviour: Commit Procedure Skill

## Actor
Agent — executing any taproot skill that ends in a commit, or responding to a user saying "commit", "let's commit", "commit that", or similar natural-language commit intent.

## Preconditions
- The agent has completed a unit of work and is ready to commit
- A taproot hierarchy exists (`.taproot/settings.yaml` and `taproot/` present)
- `git` is available and the working directory is a git repository

## Main Flow
1. Agent runs `git status` to identify all staged and unstaged changes in scope.
2. Agent classifies the commit type based on what is staged (or will be staged):
   - **Implementation commit** — staged files include source files tracked by an `impl.md`
   - **Declaration commit** — staged files include a new `impl.md` only (no matched source files)
   - **Requirement commit** — staged files include `taproot/` hierarchy files only (`intent.md`, `usecase.md`)
   - **Plain commit** — none of the above → no taproot gate runs
3. Agent reads `.taproot/settings.yaml` to identify all configured `definitionOfDone` and `definitionOfReady` conditions relevant to the commit type.
4. If the commit is an **implementation commit**, agent checks how many `impl.md` files require DoD resolution. If N > 3, the Mass Commit alternate flow fires before proceeding.
5. Agent runs the appropriate gate **proactively** — before staging — and resolves all conditions:
   - **Implementation:** for each `impl.md` that owns a staged source file:
     a. Run `taproot dod <impl-path>` and review output
     b. For each `✗` condition marked "Agent check required": read the referenced spec, reason through compliance, then run `taproot dod <impl-path> --resolve "<exact-condition-name>" --note "<reasoning>"` — **one condition per invocation**
     c. Re-run `taproot dod <impl-path>` after each resolution to check remaining failures
     d. Repeat until all conditions pass
     e. Stage the impl.md alongside its source files
   - **Declaration:** for each new `impl.md` being declared:
     a. Verify parent `usecase.md` is in `specified` state
     b. Read `.taproot/settings.yaml` `definitionOfReady` entries; add resolutions for any `check-if-affected-by` or `check:` conditions to `## DoR Resolutions` in the impl.md
     c. Stage the impl.md
   - **Requirement:** run `taproot validate-format --path <path>` and `taproot validate-structure`; fix any errors before proceeding
   - **Plain:** no gate runs
6. Agent stages all files: source files + their impl.md owners (for implementation commits).
7. Agent commits with a concise one-line message.

## Alternate Flows

### Plain commit — no taproot involvement
- **Trigger:** No staged file is tracked by any impl.md and no taproot hierarchy files are staged
- **Steps:**
  1. Agent skips all gate steps
  2. Stages and commits normally

### Conversational trigger — nothing staged yet
- **Trigger:** User says "commit" mid-session but `git status` shows no staged files
- **Steps:**
  1. Agent runs `git status` to assess what has changed
  2. Agent announces: "Nothing staged yet. Here's what's changed: [list]. Should I stage these and proceed with the commit?"
  3. On confirmation, identifies commit type, runs gate, stages, and commits

### Mass commit — many impl.md files affected
- **Trigger:** Classification reveals N > 3 impl.md files requiring DoD resolution (e.g. after an intent rename, a sweep change, or modifying a widely-shared source file like `test/unit/skills.test.ts`)
- **Steps:**
  1. Agent announces: "This commit affects `N` impl.md files — resolving DoD for each will be significant work."
  2. Agent lists all affected impl.md paths
  3. Agent offers:
     - **[A] Proceed systematically** — resolve one impl.md at a time, announce progress after each ("Resolved 2/5 — continuing…")
     - **[B] Split the commit** — stage only one impl.md's source files now, defer the rest to a follow-up commit
     - **[C] Show me what conditions need resolving** — run `taproot dod` on each impl.md and report all pending conditions before deciding
  4. Agent waits for the user's choice before proceeding
  5. If **[A]**: processes each impl.md in sequence, reporting progress
  6. If **[B]**: helps identify a clean split point and stages only the first batch
  7. If **[C]**: reports all pending conditions across all impl.md files, then re-offers [A]/[B]

### DoD condition cannot be auto-resolved
- **Trigger:** A `check:` condition requires action the agent cannot take (e.g. `tests-passing` is failing, a manual review step is required)
- **Steps:**
  1. Agent reports the blocking condition: "Cannot commit — `<condition>` is unresolved and requires: `<correction hint>`"
  2. Agent stops and waits for the user to resolve the blocker
  3. Once resolved, agent re-runs `taproot dod` and continues from step 5

### Declaration commit — parent usecase not specified
- **Trigger:** The parent `usecase.md` is not in `specified` state
- **Steps:**
  1. Agent reports: "Cannot declare implementation — parent `usecase.md` is in `<state>` state. The spec must reach `specified` before an impl.md can be committed."
  2. Agent offers: "Run `/tr-refine <usecase-path>` to complete the spec first."

### Multiple impl.md owners for a single source file
- **Trigger:** A staged source file is listed in more than one impl.md's `## Source Files`
- **Steps:**
  1. Agent announces all owners: "Found `<source-file>` tracked by N impl.md files: [list]"
  2. Runs `taproot dod` on each impl.md in turn, resolving conditions individually
  3. Stages all impl.md files alongside the source file in the same commit

## Postconditions
- All files are committed in a single well-formed commit (or a clean first batch if split)
- The pre-commit hook passes on the first attempt — no retry loop
- Every `check:` and `check-if-affected-by` condition is resolved with a written rationale in `## DoD Resolutions` or `## DoR Resolutions`
- CLAUDE.md contains a rule: when user says "commit", invoke `/tr-commit`

## Error Conditions
- **Nothing to commit** (`git status` shows clean working tree): "Nothing to commit — working tree is clean."
- **Mixed commit type** (taproot hierarchy files + source files staged together): "Taproot requires separate commits for hierarchy changes and source changes. Unstage one group and commit them separately."
- **DoD resolution loop stuck** (a condition fails after multiple resolve attempts, suggesting a bug in the condition or impl.md): agent stops, reports the stuck condition with full `taproot dod` output, and asks the user to intervene.

## Flow
```mermaid
flowchart TD
    A[/tr-commit invoked] --> B[git status — assess changes]
    B --> C{Classify commit type}
    C -->|plain| D[Stage + commit — no gate]
    C -->|requirement| E[validate-format + validate-structure]
    E --> F{Errors?}
    F -->|yes| G[Fix errors — stop]
    F -->|no| H[Stage + commit]
    C -->|declaration| I[Check parent = specified\nResolve DoR conditions in impl.md]
    I --> J{Parent specified?}
    J -->|no| K[Report — offer /tr-refine]
    J -->|yes| H
    C -->|implementation| L{N impl.md owners?}
    L -->|N > 3| M[Mass commit flow\nAnnounce + offer A/B/C]
    L -->|N ≤ 3| N[taproot dod for each impl.md]
    M --> N
    N --> O{All conditions pass?}
    O -->|yes| H
    O -->|no — agent check| P[Resolve one condition:\ntaproot dod --resolve name --note reasoning]
    P --> N
    O -->|no — unresolvable| Q[Report blocker — stop]
```

## Related
- `../usecase.md` — parent: commit-awareness defines what skills must know; this behaviour is the callable execution of those rules
- `../ad-hoc-commit-prep/usecase.md` — sibling: covers impl.md owner detection for ad-hoc work; this behaviour covers the full gate resolution loop
- `../../../hierarchy-integrity/pre-commit-enforcement/usecase.md` — the hook this skill prevents from firing reactively
- `../../../quality-gates/definition-of-done/usecase.md` — the DoD gate resolved in step 5
- `../../../quality-gates/definition-of-ready/usecase.md` — the DoR conditions resolved for declaration commits

## Acceptance Criteria

**AC-1: Implementation commit — all DoD conditions resolved before hook fires**
- Given an agent runs `/tr-commit` with staged source files tracked by an impl.md
- When the impl.md has unresolved `check:` conditions
- Then the skill resolves each condition one-at-a-time via `taproot dod --resolve` before staging, and the hook passes on first attempt

**AC-2: Conversational trigger — user says "commit" with nothing staged**
- Given a user says "commit" mid-session and nothing is staged
- When `/tr-commit` fires (via CLAUDE.md rule)
- Then the skill runs `git status`, lists what changed, and asks for confirmation before proceeding

**AC-3: Unresolvable DoD condition blocks commit**
- Given `taproot dod` reports a failing `tests-passing` condition
- When the agent cannot fix the failing tests
- Then the skill reports the blocker with the full correction hint and stops without committing

**AC-4: Declaration commit — parent usecase not specified blocks commit**
- Given an agent tries to declare a new impl.md whose parent `usecase.md` is `proposed`
- When `/tr-commit` runs the declaration gate
- Then the skill reports the state mismatch and offers `/tr-refine` before proceeding

**AC-5: Plain commit — no taproot gate runs**
- Given staged files contain no taproot hierarchy files and no source files tracked by any impl.md
- When `/tr-commit` runs
- Then no taproot gate is invoked and the commit proceeds directly

**AC-6: Multiple impl.md owners — all resolved and staged**
- Given a staged source file is listed in two different impl.md files
- When `/tr-commit` runs the implementation gate
- Then it runs `taproot dod` on each impl.md separately, resolves all conditions, and stages both alongside the source file

**AC-7: Mass commit — user warned and offered choices before proceeding**
- Given classification reveals more than 3 impl.md files requiring DoD resolution
- When `/tr-commit` runs
- Then the skill announces the count and affected files, offers [A] proceed / [B] split / [C] preview, and waits for the user's choice before resolving any conditions

## Implementations <!-- taproot-managed -->

## Status
- **State:** specified
- **Created:** 2026-03-21

## Notes
- The mass commit scenario (AC-7) is made navigable here but not optimised. A future spec will explore aggregate gate strategies — e.g. bulk "Last verified" update when source files haven't meaningfully changed, or a `taproot dod --batch` mode. This spec makes the problem visible and controllable; it defers the solution.
- There is no standalone `taproot dor` command — DoR runs automatically via the pre-commit hook. For declaration commits, the agent resolves `definitionOfReady` conditions directly in `## DoR Resolutions` before staging.
