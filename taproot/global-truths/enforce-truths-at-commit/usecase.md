# Behaviour: Enforce Truths at Commit

## Actor
Pre-commit hook — triggered automatically when a contributor commits; fires for hierarchy documents (`intent.md`, `usecase.md`, or `impl.md`) and for implementation commits (source files staged alongside or without `impl.md`)

## Preconditions
- `taproot/global-truths/` exists and contains at least one truth file
- A commit includes one or more staged hierarchy documents or source files
- The pre-commit hook is installed (`taproot init --with-hooks`)

## Main Flow

1. Pre-commit hook detects staged files — either hierarchy documents or implementation source files
2. Hook determines the commit level:
   - Staged `intent.md` → intent level
   - Staged `usecase.md` → behaviour level
   - Staged `impl.md` or source files (no higher-level doc staged) → implementation level
3. Hook collects all truth files applicable to that level:
   - Intent-scoped truths (`_intent.md` or unscoped) apply to all levels
   - Behaviour-scoped truths (`_behaviour.md`) apply to behaviour and impl
   - Impl-scoped truths (`_impl.md`) apply to impl only
4. Hook (via agent) checks each staged document against applicable truths for semantic consistency:
   - Are defined terms used consistently with their definitions?
   - Are stated business rules respected in acceptance criteria and main flow?
   - Are project conventions followed?
5. If all checks pass: hook succeeds, commit proceeds
6. If a violation is found: hook fails, commit is blocked, violation is reported with the specific truth and the conflicting excerpt

## Alternate Flows

### No applicable truths for staged documents
- **Trigger:** `global-truths/` exists but contains no truths applicable to the staged document levels
- **Steps:**
  1. Hook skips truth checks for those documents
  2. Commit proceeds normally

### global-truths/ does not exist
- **Trigger:** Project has no `taproot/global-truths/` folder
- **Steps:**
  1. Hook skips all truth enforcement
  2. Commit proceeds normally

### Multiple staged documents — partial violation
- **Trigger:** Two documents are staged; one passes, one violates a truth
- **Steps:**
  1. Hook reports the violation for the failing document
  2. Commit is blocked entirely — developer must fix the violation before re-committing
  3. The passing document is not re-checked on retry (it has not changed)

### Implementation commit: only source files staged
- **Trigger:** Developer commits source code with no hierarchy documents staged
- **Steps:**
  1. Hook detects staged source files, no `intent.md`, `usecase.md`, or `impl.md` present
  2. Hook treats the commit as implementation level
  3. All truths (intent, behaviour, and impl-scoped) are collected and checked against the staged changes
  4. No `check-if-affected-by: global-truths/...` entry in `settings.yaml` is required — truth enforcement at implementation level is automatic
  5. Pass → commit proceeds; violation → commit blocked with truth file and conflicting excerpt

### Developer disagrees with the truth (truth is wrong)
- **Trigger:** Hook blocks a commit because of a truth conflict, but the developer believes the truth is outdated
- **Steps:**
  1. Developer updates the truth file in `global-truths/`
  2. Developer stages the updated truth file alongside the hierarchy document
  3. Hook re-runs; with the updated truth, the document now passes
  4. Commit proceeds

## Postconditions
- Every committed hierarchy document is consistent with all applicable truths
- Every implementation commit is automatically checked against all applicable truths at commit time — no manual `check-if-affected-by` configuration required
- Any semantic drift between a staged artifact and an applicable truth is blocked before it enters the repository
- Truth violations are reported with enough detail to locate and fix them

## Error Conditions
- **Truth file unreadable**: hook skips that truth file, logs a warning in commit output: "`global-truths/<file>` could not be read — truth check skipped for this file." Commit is not blocked by an unreadable truth file.
- **Hook times out during agent check**: hook aborts the truth check and allows the commit with a warning: "Truth consistency check timed out — commit allowed. Run `/tr-ineed` to review truths manually."

## Flow

```mermaid
flowchart TD
    A[git commit triggered] --> B{global-truths/ exists?}
    B -->|No| C[Skip truth checks\ncommit proceeds]
    B -->|Yes| L{Staged files?}
    L -->|intent.md| M[Level: intent\napplicable: intent-scoped truths]
    L -->|usecase.md| N[Level: behaviour\napplicable: intent + behaviour truths]
    L -->|impl.md or source| O[Level: impl\napplicable: all truths]
    M --> D[Collect applicable truths]
    N --> D
    O --> D
    D --> E{Applicable truths found?}
    E -->|No| C
    E -->|Yes| F[Agent checks staged content\nterms, rules, conventions]
    F --> G{Violation found?}
    G -->|No| H[All checks pass\ncommit proceeds]
    G -->|Yes| I[Block commit\nReport: doc path, truth file, conflicting excerpt]
    I --> J[Developer fixes artifact\nor updates truth and re-stages]
    J --> F
```

## Related
- `../define-truth/usecase.md` — truths checked here are defined there
- `../apply-truths-when-authoring/usecase.md` — write-time complement; ideally catches drift before commit, reducing hook failures
- `../../hierarchy-integrity/pre-commit-enforcement/usecase.md` — this behaviour extends the pre-commit hook with truth consistency checks

## Acceptance Criteria

**AC-1: Commit blocked when spec contradicts an applicable truth**
- Given `taproot/global-truths/business-rules_behaviour.md` states "prices are always exclusive of VAT"
- When a developer commits a `usecase.md` that specifies a VAT-inclusive price
- Then the commit is blocked with a message identifying the truth file and the conflicting excerpt

**AC-2: Commit proceeds when all specs are consistent with truths**
- Given applicable truths exist and all staged specs use terms and rules consistently with them
- When the developer commits
- Then the hook passes and the commit succeeds

**AC-3: No global-truths/ — commit always proceeds**
- Given `taproot/global-truths/` does not exist
- When a developer commits any hierarchy document
- Then truth checks are skipped and the commit proceeds normally

**AC-4: Developer resolves violation by updating the truth**
- Given a commit was blocked due to a truth conflict
- When the developer updates the truth file and stages it alongside the hierarchy document
- Then the hook re-runs with the updated truth and the commit proceeds if consistent

**AC-5: Only applicable truths checked per document level**
- Given `taproot/global-truths/` contains both `glossary_intent.md` and `tech-choices_impl.md`
- When a `usecase.md` is committed
- Then only `glossary_intent.md` is checked; `tech-choices_impl.md` is not

**AC-6: Unreadable truth file produces warning but does not block commit**
- Given a truth file in `global-truths/` is malformed or unreadable
- When a commit triggers truth checks
- Then the unreadable file is skipped with a warning and the commit is not blocked by it

**AC-7: Implementation commit triggers truth check without any settings.yaml configuration**
- Given `taproot/global-truths/` contains `ux-principles_intent.md` and no `check-if-affected-by` entry for it exists in `settings.yaml`
- When a developer commits source files only (no hierarchy docs staged)
- Then the hook still checks the commit against `ux-principles_intent.md` automatically

**AC-8: Scope ladder is respected across all commit levels**
- Given `global-truths/` contains `glossary_intent.md`, `rules_behaviour.md`, and `patterns_impl.md`
- When an `intent.md` is committed → only `glossary_intent.md` is checked
- And when a `usecase.md` is committed → `glossary_intent.md` and `rules_behaviour.md` are checked
- And when source files are committed → all three files are checked

**AC-9: Implementation commit blocked when source contradicts an applicable truth**
- Given `taproot/global-truths/ux-principles_intent.md` states "all errors must be surfaced to the user immediately"
- When a developer commits source code implementing a silent failure
- Then the commit is blocked with a message identifying the truth file and the conflicting behaviour

**AC-10: No check-if-affected-by entry needed for global truth enforcement**
- Given a project has `taproot/global-truths/` with truth files but no `check-if-affected-by: global-truths/...` in `settings.yaml`
- When any commit is made at any level
- Then applicable truths are checked automatically — the absence of a settings.yaml entry does not skip enforcement

## Implementations <!-- taproot-managed -->
- [Hook Extension](./hook-extension/impl.md)

## Status
- **State:** specified
- **Created:** 2026-03-26
- **Last reviewed:** 2026-03-27
