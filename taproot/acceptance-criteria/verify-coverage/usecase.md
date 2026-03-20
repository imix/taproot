# Behaviour: Verify Acceptance Criteria Coverage

## Actor
Developer or CI pipeline running `taproot acceptance-check`

## Preconditions
- A taproot hierarchy exists with at least one `usecase.md`
- At least one test directory exists (`test/`, `tests/`, `spec/`, or configured path)

## Main Flow
1. Actor runs `taproot acceptance-check [--path taproot/] [--tests <dir>]`
2. Command walks the hierarchy and collects all criterion IDs from every `## Acceptance Criteria` section in every `usecase.md` — building a map of `ID → usecase path`
3. Command scans all test files in the configured test directories, searching each file's content for criterion ID patterns (e.g. `AC-\d+`)
4. Command computes three sets:
   - **Uncovered:** criterion IDs present in specs but not found in any test file
   - **Orphaned:** criterion IDs found in test files but not defined in any `usecase.md`
   - **Missing sections:** `usecase.md` files that have child implementation folders but no `## Acceptance Criteria` section
5. Command prints a report and exits non-zero if any uncovered or orphaned criteria exist

   ```
   taproot acceptance-check

   ✓ 12 criteria covered across 4 behaviours

   ✗ Uncovered criteria (defined in spec, missing from tests):
     AC-4  taproot/password-reset/request-reset/usecase.md
     AC-7  taproot/user-onboarding/register-account/usecase.md

   ✗ Orphaned references (in tests, not defined in any spec):
     AC-99  test/auth/password-reset.test.ts:47

   ⚠ Missing ## Acceptance Criteria sections:
     taproot/agent-context/trace-hierarchy/usecase.md

   2 uncovered, 1 orphaned, 1 missing section
   ```

## Alternate Flows

### All criteria covered
- **Trigger:** Every criterion ID found in a spec also appears in a test file, and no test references an undefined ID
- **Steps:**
  1. Command prints: `✓ N criteria covered across M behaviours`
  2. Exits 0

### `--path` scopes to a subtree
- **Trigger:** Actor provides `--path taproot/password-reset/`
- **Steps:**
  1. Command collects criteria only from `usecase.md` files under the given path
  2. Still scans all test files for references (a test for a scoped behaviour may live outside the path)
  3. Reports only uncovered/orphaned/missing within the scoped subtree

### `--tests` overrides test directory
- **Trigger:** Test files are not in the default locations (`test/`, `tests/`, `spec/`)
- **Steps:**
  1. Command scans the provided directory instead of the defaults
  2. Behaviour otherwise unchanged

### Dry run / CI mode
- **Trigger:** Actor runs with `--format json`
- **Steps:**
  1. Command outputs a JSON report instead of the human-readable format
  2. Exit code behaviour unchanged (non-zero on uncovered or orphaned)

## Postconditions
- Actor has a report of which criteria are verified by tests, which are not, and which specs are missing criteria entirely
- Exit code is 0 only when all criteria are covered and no orphaned references exist

## Error Conditions
- **No test directory found:** Command warns `"No test directory found — checked test/, tests/, spec/. Use --tests <dir> to specify."` and exits 1
- **No `usecase.md` files found under path:** Command reports `"No behaviour specs found under <path>"` and exits 0 (not an error — empty hierarchy is valid)

## Flow
```mermaid
flowchart TD
    A[taproot acceptance-check] --> B[Walk hierarchy: collect AC-N → usecase path]
    B --> C[Scan test files: find AC-N references]
    C --> D[Compute: uncovered / orphaned / missing]
    D --> E{Any issues?}
    E -- none --> F[✓ All covered — exit 0]
    E -- issues found --> G[Print report — exit 1]
```

## Related
- `taproot/acceptance-criteria/specify-acceptance-criteria/usecase.md` — produces the criterion IDs this behaviour verifies
- `taproot/requirements-compliance/check-orphans/usecase.md` — sibling check: check-orphans finds missing source files; acceptance-check finds missing test coverage
- `taproot/hierarchy-integrity/validate-format/usecase.md` — validate-format checks section presence; acceptance-check checks cross-file coverage

## Implementations <!-- taproot-managed -->
- [CLI Command](./cli-command/impl.md)

## Status
- **State:** specified
- **Created:** 2026-03-19
- **Last reviewed:** 2026-03-19

## Notes
- Criterion ID matching is grep-based: the string `AC-N` must appear verbatim in the test file content. Common patterns: `it('AC-1: happy path ...')`, `describe('AC-3')`, `// covers AC-2`. Any occurrence counts.
- The check deliberately does not parse test ASTs or integrate with test frameworks — this keeps it framework-agnostic and fast enough for pre-commit use.
- Orphaned references are a signal of either a typo (AC-99 instead of AC-9) or a deleted criterion. Both are errors worth surfacing.
- Missing sections are a warning, not an error, when the `usecase.md` has no child impl folders yet — the spec may still be in `proposed` or `specified` state with no tests written.
