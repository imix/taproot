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
4. Agent proceeds with the sub-flow matching the commit type:

### Implementation commit
1. If N impl.md files require DoD resolution and N > 3, trigger the Mass Commit alternate flow before proceeding.
2. For each `impl.md` that owns a staged source file:
   a. Run `taproot dod <impl-path>` and review output
   b. For each `✗` condition marked "Agent check required": read the referenced spec, reason through compliance, then run `taproot dod <impl-path> --resolve "<exact-condition-name>" --note "<reasoning>"` — **one condition per invocation**
   c. Re-run `taproot dod <impl-path>` after each resolution to check remaining failures
   d. Repeat until all conditions pass; if a condition remains `✗` after its `--resolve` invocation, escalate immediately to the "DoD resolution loop stuck" error condition — do not retry the same condition
3. Stage source files + all matched impl.md files and commit.

### Declaration commit
1. Verify parent `usecase.md` is in `specified`, `implemented`, or `complete` state (any non-draft state).
2. Read `.taproot/settings.yaml` `definitionOfReady` entries; for each `check-if-affected-by` or `check:` condition, write an entry directly into `## DoR Resolutions` — there is no `taproot dor` CLI; entries follow the DoD format: `condition: <name> | note: <reasoning> | resolved: <date>`
3. Stage the new impl.md and commit.

### Requirement commit
1. Run `taproot validate-format --path <path>` and `taproot validate-structure`; fix any errors before proceeding.
2. For each staged `intent.md`: verify goal starts with a verb, no implementation technology named, `## Stakeholders` present, `## Success Criteria` present — per `quality-gates/validate-intent-quality/usecase.md`.
3. For each staged `usecase.md`: verify `## Acceptance Criteria` present with at least one `**AC-N:**` Gherkin entry, `## Actor` does not name an implementation mechanism, `## Postconditions` present and non-empty — per `quality-gates/validate-usecase-quality/usecase.md`.
4. Fix any violations before staging — the hook enforces these checks and will block the commit if they fail.
5. Stage the hierarchy files and commit.

### Plain commit
1. Stage source files and commit — no taproot gate runs.

5. After a successful commit of any type, skill offers contextual What's next options:
   - **[A] Continue plan** — if `taproot/plan.md` exists with `pending` items: invokes `/tr-plan-execute`
   - **[B] Implement next** — if the commit was a requirement or declaration commit: prompts `Which behaviour should I implement next?` and invokes `/tr-implement <path>`
   - **[C] Check coverage** — `/tr-status` to review hierarchy health
   - **[D] Check backlog** — opens `taproot/backlog.md` to review deferred ideas and captured findings
   - **[E] Done** — no further action; developer continues at their own pace
   Options are filtered by context: [A] omitted if no plan exists or no pending items; [B] omitted after implementation and plain commits. Developer may ignore the prompt silently.

## Alternate Flows

### Plain commit — no taproot involvement
- **Trigger:** No staged file is tracked by any impl.md and no taproot hierarchy files are staged
- **Steps:**
  1. Agent skips all gate steps
  2. Stages and commits normally

### No `.taproot/settings.yaml` — no user-configured conditions
- **Trigger:** `.taproot/settings.yaml` does not exist or has no `definitionOfDone`/`definitionOfReady` sections
- **Steps:**
  1. Agent notes: only baseline hook checks will run — no user-configured conditions exist
  2. Skip step 3 and condition resolution for user-configured conditions — baseline requirements still apply (impl.md staged alongside source files, real diff present)
  3. Continue from step 6 normally

### Conversational trigger — nothing staged yet
- **Trigger:** User says "commit" mid-session but `git status` shows no staged files
- **Steps:**
  1. Agent runs `git status` to assess what has changed
  2. Agent announces: "Nothing staged yet. Here's what's changed: [list]. Should I stage these and proceed with the commit?"
  3. On confirmation, identifies commit type, runs gate, stages, and commits

### Mass commit — many impl.md files affected
- **Trigger:** Classification reveals N > 3 impl.md files requiring DoD resolution (e.g. after an intent rename, a sweep change, or modifying a widely-shared source file like `test/unit/skills.test.ts`) — N > 3 is the threshold at which announcing and offering a choice delivers more value than silent grinding
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

### Declaration commit — parent usecase in draft or proposed state
- **Trigger:** The parent `usecase.md` is in `draft` or `proposed` state (not yet `specified`, `implemented`, or `complete`)
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
- Developer is offered contextual What's next options (continue plan, implement next, check coverage, check backlog, or done) appropriate to the commit type

## Error Conditions
- **Nothing to commit** (`git status` shows clean working tree): "Nothing to commit — working tree is clean."
- **Mixed commit type** (taproot hierarchy files + source files staged together): "Taproot requires separate commits for hierarchy changes and source changes. Unstage one group and commit them separately."
- **DoD resolution loop stuck** (a condition fails after multiple resolve attempts, suggesting a bug in the condition or impl.md): agent stops, reports the stuck condition with full `taproot dod` output, and asks the user to intervene.

## Flow
```mermaid
flowchart TD
    A[/tr-commit invoked] --> B[git status — assess changes]
    B --> C{Classify commit type}
    C -->|implementation| IMPL
    C -->|declaration| DECL
    C -->|requirement| REQ
    C -->|plain| PLAIN

    subgraph IMPL [Implementation commit]
        I1{N impl.md owners > 3?}
        I1 -->|yes| I2[Announce + offer A/B/C\nwait for choice]
        I1 -->|no| I3[taproot dod for each impl.md]
        I2 --> I3
        I3 --> I4{All conditions pass?}
        I4 -->|no — agent check| I5[Resolve one condition:\ntaproot dod --resolve name --note reasoning]
        I5 --> I3
        I4 -->|no — unresolvable| I6[Report blocker — stop]
        I4 -->|yes| I7[Stage source files + impl.md files → commit]
    end

    subgraph DECL [Declaration commit]
        D1{Parent usecase\nnon-draft?}
        D1 -->|no| D2[Report state — offer /tr-refine — stop]
        D1 -->|yes| D3[Write DoR Resolutions\nfor each check-if-affected-by/check: condition]
        D3 --> D4[Stage impl.md → commit]
    end

    subgraph REQ [Requirement commit]
        R1[taproot validate-format\n+ validate-structure]
        R1 --> R2{Errors?}
        R2 -->|yes| R3[Fix errors — stop]
        R2 -->|no| R4[Stage hierarchy files → commit]
    end

    subgraph PLAIN [Plain commit]
        P1[Stage source files → commit]
    end
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

**AC-4: Declaration commit — parent usecase in draft or proposed state blocks commit**
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

**AC-8: Exactly three impl.md owners — mass commit flow does not fire**
- Given classification reveals exactly 3 impl.md files requiring DoD resolution
- When `/tr-commit` runs
- Then the skill proceeds with normal per-impl.md DoD resolution without entering the mass commit flow

**AC-9: What's next options offered after every successful commit**
- Given a successful commit of any type
- When the commit completes and the hook passes
- Then the skill offers contextual next steps: [A] Continue plan (only if taproot/plan.md has pending items), [B] Implement next (only for requirement/declaration commits), [C] Check coverage, [D] Check backlog, [E] Done

## Implementations <!-- taproot-managed -->
- [Agent Skill — skills/commit.md + CLAUDE.md](./agent-skill/impl.md)

## Status
- **State:** implemented
- **Created:** 2026-03-21
- **Last reviewed:** 2026-03-27
- **Refined:** 2026-03-27 — step 5 + postcondition + AC-9: contextual What's next options after every successful commit

## Notes
- The mass commit scenario (AC-7) is made navigable here but not optimised. A future spec will explore aggregate gate strategies — e.g. bulk "Last verified" update when source files haven't meaningfully changed, or a `taproot dod --batch` mode. This spec makes the problem visible and controllable; it defers the solution.
- There is no standalone `taproot dor` command — DoR runs automatically via the pre-commit hook. For declaration commits, the agent resolves `definitionOfReady` conditions directly in `## DoR Resolutions` before staging.
- The implementation of this skill should replace CLAUDE.md's existing ad-hoc pre-commit scan rule with a single trigger: "when user says 'commit', invoke `/tr-commit`." The skill owns the full procedure; the standalone CLAUDE.md scan rule becomes redundant once this skill is live.
- The CLAUDE.md trigger is a one-time implementation setup — it should be addressed in the impl.md, not re-verified on every skill execution.
