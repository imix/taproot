# Behaviour: Trace Requirement Hierarchy

## Actor
AI coding agent or agentic developer / orchestrator navigating the requirement hierarchy — asking "why does this code exist?" or "what's left to build for this intent?"

## Preconditions
- A taproot hierarchy exists with at least one `impl.md`
- `impl.md` files contain populated `## Source Files` and `## Commits` sections (for bottom-up tracing to be effective)

## Main Flow
_(Bottom-up: source file → intent)_

1. Actor invokes `/tr-trace <file-path>`
2. Agent searches all `impl.md` files under `taproot/` for the given path in `## Source Files` sections — exact match first, then fuzzy if not found
3. Agent reads the matched `impl.md` (state, commit count, test count) and navigates up to the parent `usecase.md`, then the parent `intent.md`
4. Agent displays the full traceability chain:
   ```
   File: src/auth/password-reset.ts
     └─ impl: taproot/password-reset/request-reset/email-trigger/impl.md
           State: complete | 2 commits | 1 test
        └─ behaviour: Request Password Reset [implemented]
           └─ intent: Password Reset Without Support Contact [active]
   ```
5. Agent suggests next actions based on the impl state (e.g. if `in-progress`: "want to continue with `/tr-implement`?")

## Alternate Flows

### Bottom-up from a commit hash
- **Trigger:** Actor provides a commit hash instead of a file path
- **Steps:**
  1. Agent searches all `impl.md` files for the given hash (full or short) in `## Commits` sections
  2. If found: proceeds from Main Flow step 3
  3. If not found: agent reports the commit is unlinked and suggests running `taproot link-commits`

### Top-down from an intent or behaviour
- **Trigger:** Actor provides a taproot folder path (intent or behaviour), or uses `direction: down`
- **Steps:**
  1. Agent reads the `intent.md` or `usecase.md` at the target path
  2. Agent walks the full subtree, collecting all behaviours and their implementations with state, commit count, and test count
  3. Agent displays a structured tree:
     ```
     Intent: Password Reset Without Support Contact [active]
       ├─ request-reset [implemented]
       │   ├─ email-trigger [complete, 2 commits, 1 test] ✓
       │   └─ rate-limiter [in-progress, 0 commits] ⚠
       └─ verify-identity [specified]
           └─ (no implementations)
     Progress: 1/3 behaviours fully implemented and tested
     ```
  4. Agent suggests the next unimplemented behaviour to work on

### Lateral (siblings and cousins)
- **Trigger:** Actor requests `direction: lateral` or asks "what else is in this area?"
- **Steps:**
  1. Agent reads the artifact at the target path
  2. Agent finds all sibling nodes (same parent) and cousin nodes (same grandparent, different parent)
  3. Agent displays siblings and cousins with their states, and maps each sibling back to the parent intent's success criteria to show which criteria each behaviour addresses

### Unlinked scan
- **Trigger:** Actor invokes `/tr-trace --unlinked`
- **Steps:**
  1. Agent runs `taproot check-orphans --include-unimplemented` to get the structured orphan report
  2. Agent walks the source code directories (`src/`, `lib/`, `app/`), excluding `node_modules/`, `dist/`, `.git/`, and test files
  3. Agent computes the set of source files not referenced by any `impl.md`
  4. Agent groups unlinked files by directory and suggests a likely behaviour and intent for each group
  5. Agent offers `/tr-implement` or `/tr-behaviour` invocations for each group

### File not found in any impl.md
- **Trigger:** The given file path does not appear in any `impl.md`
- **Steps:**
  1. Agent reports: "No traceability record found for `<file>`."
  2. Agent offers: run `/tr-trace --unlinked` to find all unlinked files, or `/tr-implement` to create a traceability record for this file

## Postconditions
- Actor understands the full requirement chain for the given source file, commit, or hierarchy node
- Actor knows the implementation state, commit count, and test coverage at every level of the chain
- If unlinked files exist, actor has a grouped report with suggested next actions

## Error Conditions
- **No hierarchy initialised**: no `taproot/` directory found — agent suggests `taproot init` before tracing
- **impl.md has empty Source Files section**: tracing is possible but the chain is incomplete; agent warns that source files should be populated and offers `/tr-implement` to fill the record
- **Ambiguous fuzzy match**: multiple `impl.md` files partially match the given file path — agent presents all candidates and asks the actor to confirm which one

## Status
- **State:** specified
- **Created:** 2026-03-19
- **Last reviewed:** 2026-03-19

## Notes
- Bottom-up tracing is the primary use case for this behaviour — it directly satisfies the `agent-context` intent's success criterion: "An agent can navigate from a source file up to the behaviour and intent it belongs to."
- Top-down and lateral navigation overlap functionally with `taproot coverage --format tree`, but `/tr-trace` provides richer impl-level context (commit count, test file paths, state) and is interactive — it suggests next actions rather than just reporting.
- The `--unlinked` mode complements `taproot check-orphans`: `check-orphans` finds broken references within the hierarchy; `--unlinked` finds source code that has no hierarchy entry at all.
- This behaviour is fulfilled by the `/tr-trace` agent skill (`taproot/skills/trace.md`) — there is no corresponding CLI command.
