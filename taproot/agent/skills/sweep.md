# Skill: sweep

## Description

Apply a uniform task to a filtered set of hierarchy files — enumerate matching items, confirm with the developer, then process each file in-session with live progress marking.

## Inputs

- `task` (required): Natural language description of the task to apply to each item (e.g. "add a Notes section to every usecase").
- `scope` (optional): Subtree to limit enumeration to (defaults to `taproot/`).
- `type` (optional): File type filter — `usecase`, `intent`, or `impl` (defaults to all three).

## Steps

0. Check for `.taproot/sessions/sweep-status.md`. If found, present:
   > "A previous sweep session exists (N done, M remaining, task: `<task>`). [A] Resume  [R] Restart"
   - **[A] Resume**: load the stored task description and file list; skip files already marked `[x]`; continue from the first `[ ]` file. Proceed directly to step 4.
   - **[R] Restart**: overwrite the status file from scratch and run the full flow from step 1.

1. Read the task description and determine the target file type(s):
   - If the developer mentions "all usecases" / "every usecase" → filter to `usecase.md` files
   - If the developer mentions "all intents" / "every intent" → filter to `intent.md` files
   - If the developer mentions "all impls" / "every implementation" → filter to `impl.md` files
   - If ambiguous, ask: "Should I apply this to usecases, intents, implementations, or all three?"

   Also check if the task requires **cross-item context** (e.g. "renumber all AC IDs globally" — needs awareness of IDs across files). If yes, warn:
   > "This task needs cross-item context — consider `/tr-review-all` instead."
   > And stop.

2. Enumerate matching files under the scope path (default: `taproot/`). Walk the hierarchy and collect all files matching the target type(s). Exclude any files that are clearly not candidates (e.g. OVERVIEW.md, impl.md files in `proposed` state for an intent-only sweep).

   If no files are found:
   > "No `<type>` items found under `<scope>`."
   > Stop.

3. Present the list and ask for confirmation:
   > "Found **N** `<type>` files under `<scope>`:"
   > ```
   > taproot/intent-a/behaviour-b/usecase.md
   > taproot/intent-a/behaviour-c/usecase.md
   > ...
   > ```
   > "Apply '`<task>`' to each of these **N** files? **[Y] Yes** / **[N] No**"

   If the developer says **[N]** or "no" or "cancel":
   > "Cancelled."
   > Stop.

4. For each file in the confirmed list, process it in-session:
   a. Read the file to understand its current content
   b. Apply the task directly — edit the file in place
   c. Mark the file complete and output progress:
      ```
      [x] taproot/intent-a/behaviour-b/usecase.md
      ```
   d. Write the updated checklist (task description + full file list with current `[x]`/`[ ]` state) to `.taproot/sessions/sweep-status.md`. This persists progress so the session can be resumed if interrupted.

   **For tasks requiring codebase exploration** (e.g. "add ACs from existing tests", "fill in missing fields from source code"), before processing each file:
   - Identify **where to look**: explicit directory paths relevant to the file (e.g. `test/integration/`, `src/commands/`)
   - Find the **matching artefact**: use the usecase slug (second-to-last path segment) to locate a related test file, source file, or doc (e.g. slug `validate-format` → `test/integration/validate-format.test.ts`)
   - If no match is found for a file, mark it skipped and move on:
     ```
     [ ] taproot/intent-a/behaviour-c/usecase.md — no matching test file found
     ```

   If the task description is vague, ask one clarifying question before processing the first file: "What specifically should change — is there a pattern to add, a section to fill, or a format to fix?"

5. After all files are processed, show a summary:
   > "Sweep complete — N files processed: M modified, K skipped"
   Delete `.taproot/sessions/sweep-status.md` (clean completion — no resume needed).

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

6. Present next steps:

   **What's next?**
   [A] `/tr-sweep` again — run another sweep with a different task or scope
   [B] `/tr-status` — see the full project health after these changes

## Output

- In-session edits to each matched file
- Live `[x]` progress line per file
- Summary: N processed, M modified, K skipped

## CLI Dependencies

None — all processing is done in-session by the agent.

## Notes

- The developer confirmation at step 3 is non-negotiable — no files are processed before confirmation.
- Each file is processed independently — the agent reads and edits it directly in context. No temp files or subprocesses.
- For codebase-exploration tasks: use the usecase slug (second-to-last path segment) to find related artefacts. Always verify the match exists before assuming it applies.
- If the task description is vague ("improve them"), ask one clarifying question before proceeding: "What specifically should change — is there a pattern to add, a section to fill, or a format to fix?"
- `/tr-sweep` is the Claude Code adapter command name for this skill.
