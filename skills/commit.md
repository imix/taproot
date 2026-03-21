# Skill: commit

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

3. If nothing is staged yet, announce: "Nothing staged yet. Here's what's changed: [list]. Should I stage these and proceed with the commit?" Wait for confirmation before proceeding.

4. Read `.taproot/settings.yaml` to identify all configured `definitionOfDone` and `definitionOfReady` conditions. If the file does not exist or has no `definitionOfDone`/`definitionOfReady` sections, note: "No user-configured conditions — baseline hook checks only." and proceed to the appropriate sub-flow below.

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
   c. Re-run `taproot dod <impl-path>` after each resolution to check remaining failures
   d. Repeat until all conditions pass. If a condition remains `✗` after its `--resolve` invocation, stop immediately: "Cannot resolve `<condition>` — it requires: `<correction hint>`." Wait for the user to intervene.

3. If a `check:` condition requires action you cannot take (e.g. failing tests), report: "Cannot commit — `<condition>` is unresolved and requires: `<correction hint>`." Stop and wait.

4. Stage source files + all matched impl.md files and commit with a concise one-line message.

### Declaration commit

1. Verify parent `usecase.md` is in `specified`, `implemented`, or `complete` state. If it is in `draft` or `proposed` state, report: "Cannot declare implementation — parent `usecase.md` is in `<state>` state. Run `/tr-refine <usecase-path>` to complete the spec first." Stop.

2. Read `.taproot/settings.yaml` `definitionOfReady` entries. For each `check-if-affected-by` or `check:` condition, write an entry directly into `## DoR Resolutions` in the impl.md. There is no `taproot dor` CLI — write entries by hand:
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

5. Stage the hierarchy files and commit.

### Plain commit

1. Stage source files and commit — no taproot gate runs.

---

6. After committing, run `taproot link-commits --path <taproot-root>` if any impl.md files were staged, to update their `## Commits` sections.

## Output

A clean commit where the pre-commit hook passes on the first attempt. All conditions resolved with written rationale before staging.

## CLI Dependencies

- `taproot dod`
- `taproot validate-format`
- `taproot validate-structure`
- `taproot link-commits`
