# Skill: commit

## Autonomous mode

Before following any steps, check whether autonomous mode is active:
- `TAPROOT_AUTONOMOUS=1` is set in the environment, **or**
- `--autonomous` was passed as an argument to this skill invocation, **or**
- `taproot/settings.yaml` contains `autonomous: true`

If any of these is true, **autonomous mode is active** — apply autonomous notes where they appear. If none is true, show confirmation prompts as normal.

## Description

Execute the full commit procedure: classify the commit type, run the appropriate gate proactively, resolve all conditions before staging, and commit. Handles implementation, declaration, requirement, and plain commits. Invoke this skill whenever you are about to commit, or when the user says "commit", "let's commit", "commit that", or similar.

## Inputs

- None required. The skill reads `git status` to determine what is staged or changed.

## Steps

1. Run `git status` to identify all staged and unstaged changes in scope. If nothing is staged and nothing has changed, report "Nothing to commit — working tree is clean." and stop.

2. Classify the commit type based on what is staged (or will be staged):
   - **Implementation commit** — staged files include source files tracked by an `impl.md`
   - **Declaration commit** — staged files include a new `impl.md` only (no matched source files)
   - **Requirement commit** — staged files include `taproot/` hierarchy files only (`intent.md`, `usecase.md`)
   - **Plain commit** — none of the above

   To identify impl.md ownership, run `grep -rl "<filename>" taproot/` for each candidate source file.

3. If nothing is staged yet, announce: "Nothing staged yet. Here's what's changed: [list]."

   **Interactive mode:** ask "Should I stage these and proceed with the commit?" and wait for confirmation before proceeding.

   **Autonomous mode:** stage all relevant files and proceed directly without waiting for confirmation.

4. Read `taproot/settings.yaml` to identify all configured `definitionOfDone` and `definitionOfReady` conditions. If the file does not exist or has no `definitionOfDone`/`definitionOfReady` sections, note: "No user-configured conditions — baseline hook checks only." and proceed to the appropriate sub-flow below.

5. Execute the sub-flow matching the commit type:

### Implementation commit

1. Count how many `impl.md` files require DoD resolution. If N > 3, announce: "This commit affects N impl.md files — resolving DoD for each will be significant work." List all affected paths and offer:
   - **[A] Proceed systematically** — resolve one impl.md at a time with progress updates
   - **[B] Split the commit** — stage only one impl.md's source files now, defer the rest
   - **[C] Show me what conditions need resolving** — run `taproot dod` on each and report before deciding

   Wait for the user's choice before proceeding.

2. For each `impl.md` that owns a staged source file:
   a. Run `taproot dod <impl-path>` and review the output
   b. For each `✗` condition marked "Agent check required": read the referenced spec, reason through compliance, then run:
      ```
      taproot dod <impl-path> --resolve "<exact-condition-name>" --note "<reasoning>"
      ```
      **One condition per invocation.** Do not pass multiple `--resolve` flags.

      **`document-current` resolution — mandatory steps:**
      1. Read `docs/` and `README.md` content (the actual text, not inferred state)
      2. Read the git diff for this implementation to identify what changed
      3. Compare: are the docs accurate and current relative to what was just implemented?
      4. If stale sections are found: apply updates directly, then resolve
      5. If docs are current: resolve with a note describing what you read and why no update is needed

      **Prohibited resolutions for `document-current`:**
      - "nothing in backlog → docs are fine"
      - "impl.md says complete → docs must be current"
      - "no related backlog items → no doc update needed"
      - Any resolution that does not involve reading `docs/` content and comparing it to the git diff

   c. Re-run `taproot dod <impl-path>` after each resolution to check remaining failures
   d. Repeat until all conditions pass. If a condition remains `✗` after its `--resolve` invocation, stop immediately: "Cannot resolve `<condition>` — it requires: `<correction hint>`." Wait for the user to intervene.

3. If a `check:` condition requires action you cannot take (e.g. failing tests), report: "Cannot commit — `<condition>` is unresolved and requires: `<correction hint>`." Stop and wait.

4. **Truth consistency check** — if `taproot/global-truths/` exists:
   a. Collect all truth files applicable at impl level: intent-scoped truths (always), behaviour-scoped truths, and impl-scoped truths.
   b. Read each applicable truth file. If a file is unreadable, note it and skip.
   c. Check the staged impl.md and source changes for consistency with applicable truths:
      - Are defined architectural patterns and project conventions being followed?
      - Are implementation-level rules respected?
      - Are domain terms used consistently with their definitions?
   d. If a conflict is found, surface it before proceeding:
      > "Truth conflict: `<excerpt>` in staged changes conflicts with `global-truths/<file>`: `<truth excerpt>`. [A] Fix the implementation | [B] Update the truth | [C] Proceed with conflict noted"
      Wait for the developer's choice. Do not proceed to step 5 until resolved.
   e. If no conflicts (or all resolved): run `taproot truth-sign` to record the session marker the hook validates.

5. **Suggest commit tag** — derive the conventional tag from the matched impl.md paths:
   - For each matched `impl.md`, extract the relative path between `taproot/specs/` and `/impl.md` → `<intent>/<behaviour>/<impl>`
   - If the developer has already supplied a commit message that starts with a recognised prefix (`taproot(`, `fix:`, `feat:`, `chore:`, `refine:`, `spec:`, `build:`, `docs:`): use it as-is — do not suggest or prepend anything
   - If all matched impl.md files share the same `<intent>/<behaviour>` prefix:
     - Single impl: suggest `taproot(<intent>/<behaviour>/<impl>):`
     - Multiple impls under the same behaviour: suggest `taproot(<intent>/<behaviour>):`
   - If matched impl.md files span two or more distinct `<intent>/<behaviour>` paths:
     - Report: *"Staged files span multiple behaviours: `<path-1>`, `<path-2>`. Suggested: commit them separately, one per behaviour, to keep commit history traceable."*
     - Offer: `[A] Commit all together (no single tag)  [B] Split — commit one behaviour at a time`
     - `[B]`: stage only the first behaviour's files, apply its tag, commit; then repeat for the remainder
   - If an impl.md path does not match `taproot/specs/<intent>/<behaviour>/<impl>/impl.md`, skip the tag suggestion for that file and note: *"Could not derive tag from `<path>` — path layout unexpected."*
   - Present: `Suggested commit tag: taproot(<path>):`

6. Stage source files + all matched impl.md files and commit with the suggested tag prefix (or the developer-supplied message).

### Declaration commit

1. Verify parent `usecase.md` is in `specified`, `implemented`, or `complete` state. If it is in `draft` or `proposed` state, report: "Cannot declare implementation — parent `usecase.md` is in `<state>` state. Run `/tr-refine <usecase-path>` to complete the spec first." Stop.

2. Read `taproot/settings.yaml` `definitionOfReady` entries. For each `check-if-affected-by` or `check:` condition, write an entry directly into `## DoR Resolutions` in the impl.md. There is no `taproot dor` CLI — write entries by hand:
   ```
   condition: <name> | note: <reasoning> | resolved: <date>
   ```

3. Stage the new impl.md and commit.

### Requirement commit

1. Run `taproot validate-format --path <path>` and `taproot validate-structure`. Fix any errors before proceeding.

2. For each staged `intent.md`, verify:
   - `## Goal` starts with a verb (e.g. "Enable", "Allow", "Ensure", "Provide")
   - Goal does not name implementation technology (REST, SQL, API, PostgreSQL, etc.)
   - `## Stakeholders` section is present and non-empty
   - `## Success Criteria` section is present with at least one measurable criterion

3. For each staged `usecase.md`, verify:
   - `## Acceptance Criteria` is present with at least one `**AC-1:**` Given/When/Then entry
   - `## Actor` names a human, external system, or service — not an implementation mechanism
   - `## Postconditions` is present and non-empty

4. Fix any violations before staging — the hook enforces these checks and will block the commit if they fail.

5. **Truth consistency check** — if `taproot/global-truths/` exists:
   a. For each staged hierarchy document, determine its level (intent, behaviour, impl) and collect applicable truth files using scope rules (intent-scoped truths apply to all levels; behaviour-scoped to behaviour+impl; impl-scoped to impl only; unscoped defaults to intent-scoped).
   b. Read each applicable truth file. If a file is unreadable, note it and skip.
   c. Check each staged document for semantic consistency with applicable truths:
      - Are defined terms used consistently with their definitions?
      - Are stated business rules respected in acceptance criteria and main flow?
      - Are project conventions followed?
   d. If a conflict is found, surface it before proceeding:
      > "Truth conflict in `<file>`: `<excerpt>` conflicts with `<truth file>`: `<truth excerpt>`. [A] Fix the spec | [B] Update the truth | [C] Proceed with conflict noted"
      Wait for the developer's choice. Do not proceed to step 6 until resolved.
   e. If no conflicts (or all resolved): run `taproot truth-sign` to record the session marker the hook validates.

6. Stage the hierarchy files and commit.

### Plain commit

1. Stage source files and commit — no taproot gate runs.

---

6. After committing, run `taproot link-commits --path <taproot-root>` if any impl.md files were staged, to update their `## Commits` sections.

7. Offer contextual What's next options based on the commit type:
   - **[A] Continue plan** — only if `taproot/plan.md` exists and contains `pending` items: invoke `/tr-plan-execute`
   - **[B] Implement next** — only for requirement or declaration commits: prompt `Which behaviour should I implement next?` then invoke `/tr-implement <path>`
   - **[C] Check backlog** — open `.taproot/backlog.md` to review deferred ideas and captured findings
   - **[D] Check coverage** — `/tr-status` to review hierarchy health
   - **[E] Done** — no further action

   Omit [A] if no plan exists or no pending items remain. Omit [B] after implementation and plain commits. Developer may ignore the prompt silently.

## Output

A clean commit where the pre-commit hook passes on the first attempt. All conditions resolved with written rationale before staging.

## CLI Dependencies

- `taproot dod`
- `taproot validate-format`
- `taproot validate-structure`
- `taproot link-commits`
