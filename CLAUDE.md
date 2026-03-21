 * never add node_modules to git
 * build after each implementation
 * use short one line commit messages
 * when editing skills in `taproot/skills/`, always copy the file back to `skills/` (package source) before running `taproot update` — otherwise update overwrites your changes

## Before committing

Before staging and committing any source files, proactively scan for impl.md ownership:

1. Run `git status` to identify which source files you are about to stage
2. For each file, run `grep -rl "<filename>" taproot/` to find any impl.md that lists it in its `## Source Files` section
3. If matches are found, announce them: "Found `<source-file>` tracked by `<impl-path>` — staging it alongside."
4. Run `taproot dod <impl-path>` for each matched impl.md to resolve pending conditions and produce a real diff
   - If no pending conditions and Last verified is not today: update `Last verified` to today
   - If no pending conditions and Last verified is already today: append a DoD resolution note
5. Stage all matched impl.md files alongside the source files in the same commit

This prevents the pre-commit hook from failing with "Stage impl.md alongside your source files."

If no impl.md claims any staged file, treat it as a plain commit and proceed normally.

## Writing intent.md and usecase.md

The pre-commit hook enforces these quality rules at commit time. Write specs correctly on the first attempt:

**For `intent.md`:**
- `## Goal` must start with a verb describing a *business outcome*: "Enable", "Allow", "Ensure", "Provide", "Reduce", etc.
- Goal must NOT mention implementation technology (REST, SQL, API, PostgreSQL, etc.)
- `## Stakeholders` must list at least one stakeholder with their perspective
- `## Success Criteria` must contain at least one measurable criterion distinct from the goal

**For `usecase.md`:**
- `## Acceptance Criteria` must be present with at least one `**AC-1:**` Gherkin entry (Given/When/Then)
- `## Actor` must name a human, external system, or service — not an implementation mechanism (not "the endpoint", "the database", "the API")
- `## Postconditions` must be present and non-empty

If the hook rejects a spec, the error message includes a correction hint. Fix the issue, re-stage, and re-commit.
