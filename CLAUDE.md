 * never add node_modules to git
 * build after each implementation
 * use short one line commit messages
 * when editing skills in `taproot/skills/`, always copy the file back to `skills/` (package source) before running `taproot update` — otherwise update overwrites your changes

## Natural language triggers

See `## Natural Language Triggers` in `skills/guide.md` — it lists phrases that must invoke specific taproot skills (commit, plan, backlog, etc.) instead of built-in agent tools.

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
- Before writing a `usecase.md`, read the parent `intent.md`'s `## Goal` section and verify that your Acceptance Criteria address it. If the ACs do not plausibly serve the parent intent's goal, revise the ACs or flag the misalignment before saving the spec.

If the hook rejects a spec, the error message includes a correction hint. Fix the issue, re-stage, and re-commit.
