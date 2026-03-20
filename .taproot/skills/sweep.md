# Skill: sweep

## Description

Apply a uniform task to a filtered set of hierarchy files — enumerate matching items, confirm with the developer, then call `taproot apply` to execute.

## Inputs

- `task` (required): Natural language description of the task to apply to each item (e.g. "add a Notes section to every usecase").
- `scope` (optional): Subtree to limit enumeration to (defaults to `taproot/`).
- `type` (optional): File type filter — `usecase`, `intent`, or `impl` (defaults to all three).

## Steps

1. Read the task description and determine the target file type(s):
   - If the developer mentions "all usecases" / "every usecase" → filter to `usecase.md` files
   - If the developer mentions "all intents" / "every intent" → filter to `intent.md` files
   - If the developer mentions "all impls" / "every implementation" → filter to `impl.md` files
   - If ambiguous, ask: "Should I apply this to usecases, intents, implementations, or all three?"

   Also check if the task requires **cross-item context** (e.g. "renumber all AC IDs globally" — needs awareness of IDs across files). If yes, warn:
   > "This task needs cross-item context — consider `/tr-review-all` instead."
   > And stop without writing any files.

2. Enumerate matching files under the scope path (default: `taproot/`). Walk the hierarchy and collect all files matching the target type(s). Exclude any files that are clearly not candidates (e.g. OVERVIEW.md, impl.md files in `proposed` state for an intent-only sweep).

   If no files are found:
   > "No `<type>` items found under `<scope>`."
   > Stop without writing any files.

3. Present the list and ask for confirmation:
   > "Found **N** `<type>` files under `<scope>`:"
   > ```
   > taproot/intent-a/behaviour-b/usecase.md
   > taproot/intent-a/behaviour-c/usecase.md
   > ...
   > ```
   > "Apply '`<task>`' to each of these **N** files? **[Y] Yes** / **[N] No**"

   If the developer says **[N]** or "no" or "cancel":
   > "Cancelled — no files written."
   > Stop.

4. Write `filelist.txt` to the project root (one relative path per line, relative to project root):
   ```
   taproot/intent-a/behaviour-b/usecase.md
   taproot/intent-a/behaviour-c/usecase.md
   ```

   Write `prompt.txt` to the project root containing the task description. The prompt should be self-contained — the agent reading it has access to the file (via `$TAPROOT_APPLY_FILE`) but no other context, so be explicit:
   ```
   <task description>

   Edit the file in place. Read the file first to understand its current content, then apply the task.
   ```

5. Run `taproot apply filelist.txt prompt.txt` and wait for the summary output.

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

6. Show the summary from `taproot apply` and present next steps:

   **What's next?**
   [A] `/tr-sweep` again — run another sweep with a different task or scope
   [B] `/tr-status` — see the full project health after these changes

## Output

- `filelist.txt` — one relative file path per line
- `prompt.txt` — the task prompt passed to the agent per file
- Summary from `taproot apply`

## CLI Dependencies

- `taproot apply`

## Notes

- `/tr-sweep` generates the inputs; `taproot apply` executes the per-file agent invocations.
- The developer confirmation at step 3 is non-negotiable — no files are written before confirmation.
- Keep prompts in `prompt.txt` self-contained: the agent has filesystem access but no conversation context.
- If the task description is vague ("improve them"), ask one clarifying question before proceeding: "What specifically should change — is there a pattern to add, a section to fill, or a format to fix?"
- `/tr-sweep` is the Claude Code adapter command name for this skill.
