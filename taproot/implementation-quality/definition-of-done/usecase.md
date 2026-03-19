# Behaviour: Definition of Done Enforcement

## Actor
`/tr-implement` — triggered automatically at the end of the implement flow before marking an impl `complete`. Can also be invoked standalone by a developer or CI pipeline to check the current state.

## Preconditions
- Implementation work is complete (code written, tests written)
- `impl.md` exists for the behaviour being implemented
- If DoD conditions are configured, `.taproot.yaml` contains a `definition-of-done` list following the declared syntax (see Notes)

## Main Flow
1. System reads `definition-of-done` conditions from `.taproot.yaml`
2. System runs all conditions — every condition runs regardless of whether earlier ones fail
3. For each condition, system records: name, pass/fail, output, and a proposed correction if failed. For `document-current` conditions specifically: the agent reads recent git commits and diffs, identifies stale sections in `README.md` and `docs/`, and applies updates directly. The condition passes once updates are made — no correction prompt is shown.
4. If all conditions pass: system marks the impl `state: complete` and reports success
5. If any conditions fail: system reports all failures together, each with a proposed correction, and does NOT mark the impl complete

## Alternate Flows
### No DoD configured
- **Trigger:** `.taproot.yaml` exists but has no `definition-of-done` section, or the file does not exist
- **Steps:**
  1. System skips the DoD check entirely
  2. System marks impl `complete` and notes: "No Definition of Done configured — skipping checks"

### Standalone check (outside `/tr-implement`)
- **Trigger:** Developer or CI pipeline runs the DoD check manually against an existing impl
- **Steps:**
  1. System runs all conditions as in the main flow
  2. System reports full pass/fail summary with proposed corrections
  3. System does not modify `impl.md` state — reporting only

### Custom shell command condition
- **Trigger:** A condition in `.taproot.yaml` is declared as a shell command rather than a built-in condition name
- **Steps:**
  1. System executes the shell command in the project root
  2. Exit code 0 = pass; non-zero = fail
  3. On failure, system includes stdout/stderr in the report and proposes: "Fix the issue reported above, then re-run"

## Postconditions
- If all conditions passed: `impl.md` has `state: complete`
- If any condition failed: `impl.md` state is unchanged; developer has a full list of failures with proposed corrections

## Error Conditions
- **Condition script not found**: reported as a failure with correction "Ensure the command exists and is executable from the project root"
- **Condition times out**: reported as a failure with correction "Check for hanging processes or increase the timeout in `.taproot.yaml`"
- **`.taproot.yaml` DoD section is malformed**: system aborts the check and reports a parse error with the offending line; impl is not marked complete

## Status
- **State:** specified
- **Created:** 2026-03-19
- **Last reviewed:** 2026-03-19

## Notes
- Conditions in `.taproot.yaml` use a mixed syntax: built-in names are bare strings; custom conditions use `run:` with optional `name:` and `correction:` keys; parameterizable built-ins use a `key: value` form:
  ```yaml
  definitionOfDone:
    - tests-passing
    - linter-clean
    - document-current: README.md and docs/ accurately reflect all currently implemented CLI commands, skills, and configuration options
    - check-if-affected: src/commands/update.ts
    - check-if-affected: skills/guide.md
    - run: npm run custom-check
      name: my-check
      correction: "Run the fix script"
  ```
- Built-in names (`tests-passing`, `linter-clean`, `commit-conventions`) resolve to known commands and standard corrections without requiring shell configuration. Any entry with a `run:` key is executed as a shell command from the project root.
- `document-current` is a parameterizable built-in that triggers agent-driven documentation review. When this condition runs, the agent reads the git log for recent changes, then reads `README.md` and `docs/` to identify any sections that are stale or missing. The agent applies the necessary updates before the condition passes — it does not prompt for manual confirmation. The parameter string describes what accurate documentation looks like (used as the agent's review target).
- `check-if-affected: <file-or-description>` is a parameterizable built-in that triggers agent-driven impact reasoning. When this condition runs, the agent reads the git diff for the current impl, then reasons: "given what changed, should `<file-or-description>` have been updated too?" If yes and it was not touched — condition fails with: "This change likely requires updating `<target>` — review and apply." If the agent determines the change does not affect the target — condition passes silently. Multiple `check-if-affected` entries can be listed, each targeting a different file or concern.
- "Propose corrections" means: for built-in conditions, the system states the standard fix explicitly (e.g. "Run `npm test` and fix failing tests"). For custom shell conditions, stdout/stderr from the failed command is surfaced as correction context, along with the `correction:` field if provided.
- The README and docs currency condition is resolved via `document-current` — rather than a standalone triggered behaviour, it becomes a DoD gate enforced here with agent-driven review and update.
