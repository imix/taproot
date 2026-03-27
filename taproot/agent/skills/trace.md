# Skill: trace

## Description

Navigate the requirement hierarchy in any direction: from code to intent (bottom-up), from intent to code (top-down), laterally across siblings, or scan for unlinked code. Answers "why does this code exist?" and "what's left to build?"

## Inputs

- `target` (required unless `--unlinked`): A file path, commit hash, or Taproot folder path.
- `--unlinked` (flag): Scan the codebase for source files not referenced by any `impl.md`.
- `direction` (optional): `up` (bottom-up, default for file/commit inputs), `down` (top-down, default for intent/behaviour inputs), `lateral` (siblings and cousins).

## Steps

### Bottom-up (from a source file)

1. Search all `impl.md` files under `taproot/` for the given file path in the **Source Files** section. Use exact match first, then fuzzy match if not found.

2. If found: read that `impl.md`. Note the behaviour folder it lives in.

3. Read the parent `usecase.md`. Note the intent folder it lives in.

4. Read the parent `intent.md`.

5. Display the full chain:

```
File: src/auth/password-reset.ts
  └─ impl: taproot/password-reset/request-reset/email-trigger/impl.md
        State: complete | 2 commits | 1 test
     └─ behaviour: taproot/password-reset/request-reset/usecase.md
           Behaviour: Request Password Reset
           State: implemented
        └─ intent: taproot/password-reset/intent.md
               Intent: Password Reset Without Support Contact
               State: active
```

6. If not found in any `impl.md`: "No traceability record found for `<file>`. This file may be unlinked."

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

   **What's next?**
   [A] `/tr-trace --unlinked` — find all unlinked files across the codebase
   [B] `/tr-implement <path>/` — create a traceability record for this file

   If the chain was found, present:

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

   **What's next?**
   [A] `/tr-refine <behaviour-path>/` — update the spec if it has drifted from the code
   [B] `/tr-implement <behaviour-path>/` — add a new implementation under this behaviour

### Bottom-up (from a commit hash)

1. Search all `impl.md` files under `taproot/` for the given hash (full or short) in the **Commits** section.

2. If found: proceed as above from step 2.

3. If not found: "Commit `<hash>` is not referenced by any `impl.md`. Run `taproot link-commits` to auto-link commits with `taproot(<path>):` tags."

### Top-down (from an intent or behaviour folder)

1. Read the `intent.md` or `usecase.md` at `target`.

2. Walk the full subtree, collecting all behaviours and their implementations.

3. Display as a structured tree with status indicators:

```
Intent: Password Reset Without Support Contact [active]
  ├─ request-reset [implemented]
  │   ├─ email-trigger [complete, 2 commits, 1 test] ✓
  │   └─ rate-limiter [in-progress, 0 commits, 0 tests] ⚠
  ├─ verify-identity [specified]
  │   └─ (no implementations)
  └─ set-new-password [proposed]
      └─ (no implementations)

Progress: 1/5 behaviours fully implemented and tested
```

4. Suggest next actions based on the tree state:

   **What's next?**
   [A] `/tr-implement taproot/<intent-slug>/<unimplemented-behaviour-slug>/` — implement the first unimplemented behaviour
   [B] `/tr-refine taproot/<intent-slug>/<behaviour-slug>/` — update a spec that has drifted

### Lateral (siblings and cousins)

1. Read the artifact at `target`.

2. Find all sibling nodes (same parent).

3. Find cousin nodes (same grandparent, different parent) if the parent is a behaviour.

4. Display:

```
Behaviour: request-reset (under: password-reset)

Siblings (other behaviours under password-reset):
  ├─ verify-identity [specified]
  └─ set-new-password [proposed]

Related intent: Password Reset Without Support Contact [active]
  Success criteria addressed by this behaviour:
    ✓ "Users can request a reset link without contacting support"
    ? "Reset link expires after 15 minutes" (not verified in postconditions)
```

### --unlinked (find orphaned code)

1. Run `taproot check-orphans --include-unimplemented` to get the structured orphan report.

2. Walk the source code directories (common locations: `src/`, `lib/`, `app/`). List all source files.

3. Collect all file paths mentioned in any `impl.md` Source Files sections.

4. Compute the difference: source files NOT in any `impl.md`.

5. Group unlinked files by directory. For each group, suggest a likely behaviour based on the directory name and file names:

```
Unlinked source files (not referenced by any impl.md):

src/notifications/ (4 files)
  Possible behaviour: "Send notification on account event"
  Suggested intent: user-onboarding or a new notifications intent
  → /taproot:behaviour taproot/user-onboarding/ "send account notification emails"

src/admin/ (12 files)
  Possible behaviour: "Admin dashboard" or "Manage user accounts"
  Suggested intent: create new admin-panel intent
  → /taproot:intent "Admin dashboard for managing user accounts"
```

## Output

A formatted trace showing the chain from intent → behaviour → implementation → code → tests, or an unlinked file report with suggestions.

## CLI Dependencies

- `taproot check-orphans`
- `taproot coverage`

## Notes

- For `--unlinked`, only scan directories that are likely to contain application code. Skip: `node_modules/`, `dist/`, `.git/`, `test/`, `__tests__/`, `*.test.*`, `*.spec.*`.
- If the hierarchy is very deep (>5 levels of sub-behaviours), collapse intermediate levels in the display and offer to expand on request.
