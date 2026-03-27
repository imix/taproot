# Behaviour: Proactive Impl.md Scan Before Ad-Hoc Commits

## Actor
Agent executing an ad-hoc implementation task — modifying source files outside any taproot skill (e.g. a direct bug fix, refactor, or exploratory change not driven by `/tr-implement`)

## Preconditions
- The agent has modified one or more source files as part of an ad-hoc task
- The agent is about to stage and commit those files
- A taproot hierarchy exists with impl.md files that may claim ownership of the modified files

## Main Flow
1. Agent runs `git status` (or `git diff --name-only`) to enumerate the source files it is about to stage
2. Agent uses `grep -rl "<filename>" taproot/` for each staged filename to locate impl.md files that reference it — avoids reading every impl.md in the hierarchy
3. Agent cross-references: collects all matched impl.md paths
4. Agent announces what it found: "Found `<source-file>` tracked by `<impl-path>` — staging it alongside."
5. For each matched impl.md, agent runs `taproot dod <impl-path>` to check pending conditions and resolve them, producing a real diff in the impl.md
6. Agent stages matched impl.md files alongside the source files
7. Agent commits everything in a single commit

## Alternate Flows

### No impl.md claims ownership
- **Trigger:** No impl.md lists any of the staged source files
- **Steps:**
  1. Agent treats this as a plain commit — no taproot gate runs
  2. Agent stages and commits the source files normally

### Impl.md already resolved — no pending conditions
- **Trigger:** `taproot dod` reports all conditions resolved and impl.md has no meaningful diff to add
- **Steps:**
  1. If `Last verified` is not today's date: agent updates it to produce a real diff
  2. If `Last verified` is already today: agent appends a DoD resolution note (e.g. `fix-<topic> | note: <summary of change> | resolved: <date>`) to produce a real diff
  3. Agent stages and commits impl.md alongside source files

### Multiple impl.md files claim the same source file
- **Trigger:** Two or more impl.md files list the same modified source file in their `## Source Files` section
- **Steps:**
  1. Agent resolves DoD for all owners
  2. All matched impl.md files are staged and included in the same commit

## Postconditions
- The pre-commit hook passes on the first attempt — no "Stage impl.md alongside source files" error
- All impl.md files that claim ownership of modified source files are updated in the same commit

## Error Conditions
- **Taproot hierarchy absent** (`taproot/` directory does not exist): agent skips the scan and treats all commits as plain commits
- **`taproot dod` surfaces a condition requiring human judgement** (e.g. a `check:` condition): agent pauses, presents the condition to the developer, and waits for a resolution note before continuing

## Flow
```mermaid
flowchart TD
    A[Agent about to stage source files] --> B["git status — enumerate modified files"]
    B --> C["grep -rl each filename in taproot/"]
    C --> D{Any impl.md claims\na staged file?}
    D -- No --> E[Plain commit — stage and commit source files]
    D -- Yes --> F[Announce: found X tracked by impl-path]
    F --> G[Run taproot dod for each matched impl.md]
    G --> H{Pending conditions?}
    H -- Yes --> I[Resolve conditions — record notes in DoD Resolutions]
    H -- No --> J{Last verified\n= today?}
    J -- No --> K[Update Last verified date]
    J -- Yes --> L[Append DoD resolution note]
    I --> M[Stage impl.md files alongside source files]
    K --> M
    L --> M
    M --> N[Commit everything in one commit]
```

## Related
- `../usecase.md` — parent: commit-awareness governs skill design; this behaviour governs ad-hoc agent commits outside any skill
- `../../../hierarchy-integrity/pre-commit-enforcement/usecase.md` — the hook this behaviour prevents from firing unexpectedly

## Acceptance Criteria

**AC-1: Owned source file triggers impl.md staging**
- Given an agent is about to commit a source file listed in an impl.md's `## Source Files` section
- When the agent runs the proactive scan (`grep -rl`) before staging
- Then the agent announces the match, resolves DoD, and stages the impl.md in the same commit

**AC-2: Unowned source file proceeds as plain commit**
- Given an agent is about to commit a source file not listed in any impl.md
- When the agent runs the proactive scan
- Then no impl.md is staged and the commit proceeds without any taproot gate

**AC-3: Already-resolved impl.md with Last verified not today gets date bump**
- Given a matched impl.md has no pending DoD conditions and Last verified is a past date
- When the agent prepares the commit
- Then the agent updates `Last verified` to today to produce a real diff

**AC-4: Already-resolved impl.md with Last verified = today gets resolution note**
- Given a matched impl.md has no pending DoD conditions and Last verified is already today
- When the agent prepares the commit
- Then the agent appends a DoD resolution note to produce a real diff

**AC-5: Multiple owners all staged in one commit**
- Given two impl.md files both list the same staged source file
- When the agent runs the proactive scan
- Then both impl.md files are resolved and staged in the same commit

## Implementations <!-- taproot-managed -->
- [CLAUDE.md — Pre-Commit Ownership Scan](./claude-md/impl.md)

## Status
- **State:** implemented
- **Created:** 2026-03-20
