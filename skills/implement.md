# Skill: implement

## Description

Implement a behaviour spec: write the code, write the tests, create the `impl.md` traceability record, and commit with the conventional tag format. The spec is the contract — code must satisfy it, not redefine it.

## Inputs

- `path` (required): Path to the behaviour folder containing `usecase.md` to implement.
- `name` (optional): Slug for the implementation folder (e.g., `rest-api`, `background-job`). If omitted, derive from the implementation approach chosen.

## Steps

1. Read `<path>/usecase.md` thoroughly. Understand:
   - The Actor and what they initiate
   - Every step in the Main Flow
   - Every Alternate Flow and its trigger condition
   - Every Error Condition and its expected system response
   - All Postconditions — these are the acceptance test targets

2. Read any existing implementation folders under `<path>/`. Understand what is already built to avoid duplication and to understand the existing architecture.

3. Walk up the hierarchy: read the parent `intent.md` to understand the broader goal. This context should inform design decisions (e.g., if the intent has a constraint about performance, that should influence implementation choices).

4. **Enter plan mode.** Propose the implementation plan before writing any code:
   - Which files to create or modify (with brief rationale for each)
   - Which tests to write, mapped to specific UseCase steps and postconditions
   - Any design decisions that need to be made (with options and recommendation)
   - The implementation folder slug and path

   Present the plan. Do not proceed to writing code until the user approves.

5. Create the implementation folder `<path>/<impl-slug>/` and write `impl.md`:
   - **Behaviour**: relative path to `../usecase.md`
   - **Design Decisions**: record every non-obvious choice made during implementation, with the reason
   - **Source Files**: list every file created or significantly modified, with a one-line description of its role
   - **Commits**: leave placeholder — will be filled by `taproot link-commits` after commit
   - **Tests**: list every test file, with a brief description of what scenarios it covers
   - **Status**: `in-progress`

5a. Update the parent `usecase.md`'s `## Implementations <!-- taproot-managed -->` section:
    - Read `<path>/usecase.md`.
    - If the `## Implementations` section does not exist, insert it immediately before `## Status` (or append at end of file if `## Status` is absent), with the heading `## Implementations <!-- taproot-managed -->`.
    - Derive the link title from the first `# Heading` line of the new `impl.md`; strip any type prefix (e.g. `# Implementation: Foo` → `Foo`). Fall back to the folder slug if no heading is found.
    - Append `- [<Title>](./<impl-slug>/impl.md)` to the section if the link is not already present.
    - If the behaviour `**State:**` is `specified`, advance it to `implemented` and update `**Last reviewed:**` to today.
    - Write the updated `usecase.md`. Stage it together with `impl.md` for the declaration commit.

6. **Declaration commit** — commit `impl.md` and any `usecase.md` link-section update together (no source files):
   ```
   taproot(<intent-slug>/<behaviour-slug>/<impl-slug>): declare implementation
   ```
   The pre-commit hook will run Definition of Ready (DoR) checks on the parent `usecase.md`. If DoR fails, fix the spec before proceeding — do not bypass the hook.

7. After the declaration commit, implement:
   a. Write the source code files
   b. Write the tests — each test should be traceable to a specific UseCase step, postcondition, error condition, or alternate flow trigger. Name tests descriptively.
   c. Verify the tests pass

8. Run `taproot dod <impl-path>` to evaluate the Definition of Done. For agent-driven conditions (`check-if-affected`, `document-current`): reason about each, apply any needed changes, then record your resolution with `taproot dod <impl-path> --resolve "<condition>" --note "<reasoning>"`. Re-run until all conditions pass. `taproot dod` marks `impl.md` state `complete` when all pass.

9. **Implementation commit** — commit source files and `impl.md` together:
   ```
   taproot(<intent-slug>/<behaviour-slug>/<impl-slug>): <what this commit does>
   ```
   The pre-commit hook checks that `impl.md` changed only in the `## Status` section (state `in-progress` → `complete`) and re-runs DoD in dry-run mode.

10. Run `taproot link-commits --path <taproot-root>` to update the `impl.md` Commits section with the new hashes.

11. Run `taproot validate-structure --path <taproot-root>`.

12. Run `taproot coverage --path <taproot-root>` to show updated progress.

## Output

- Working source code satisfying the UseCase
- Tests covering all main flow steps, alternate flows, postconditions, and error conditions
- A `impl.md` in `<path>/<impl-slug>/impl.md` with all sections filled
- Two commits: a declaration commit (impl.md alone) and an implementation commit (source + impl.md)

## CLI Dependencies

- `taproot link-commits`
- `taproot dod`
- `taproot validate-structure`
- `taproot coverage`

## Document Format Reference

```markdown
# Implementation: <Title>

## Behaviour
../usecase.md

## Design Decisions
- <Decision: what was chosen and why — reference UseCase requirements>

## Source Files
- `<path/to/file.ts>` — <what this file does for this implementation>

## Commits
- `<hash>` — <one-line summary>

## Tests
- `<path/to/test.test.ts>` — <which UseCase steps/conditions this covers>

## Status
- **State:** planned | in-progress | complete | needs-rework
- **Created:** <YYYY-MM-DD>
- **Last verified:** <YYYY-MM-DD>

## Notes
<Technical debt, known limitations, future improvements>
```

## Notes

- If the UseCase has error conditions or alternate flows that are difficult to implement in the current sprint, create the `impl.md` with Status `in-progress` and add a Notes entry listing what is deferred and why.
- If you discover during implementation that the spec is incomplete or incorrect, **stop and use `/taproot:refine`** to update the spec before continuing. Do not silently diverge from the spec.
- The commit message tag path should match the impl folder's path relative to the `taproot/` root.
