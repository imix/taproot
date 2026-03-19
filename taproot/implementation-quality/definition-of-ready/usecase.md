# Behaviour: Definition of Ready

## Actor
`taproot commithook` — triggered automatically when a contributor commits an `impl.md` file without source code changes (the "I'm starting this implementation" declaration commit).

## Preconditions
- A git pre-commit hook invoking `taproot commithook` is installed
- The commit contains at least one `impl.md` file and no source code changes
- The `impl.md` references a parent behaviour via `../usecase.md`

## Main Flow
1. `taproot commithook` detects that staged files include `impl.md` and no source files — classifies as a DoR commit
2. System reads the parent `usecase.md` referenced by the `impl.md`
3. System checks baseline DoR conditions (always enforced, not configurable):
   a. `usecase.md` exists at the expected parent path
   b. `usecase.md` has `state: specified`
   c. `taproot validate-format` passes on the `usecase.md`
   d. `usecase.md` contains a `## Flow` section with a Mermaid diagram
   e. `usecase.md` contains a `## Related` section
4. System reads `definitionOfReady` conditions from `.taproot.yaml` (if present) and runs each — same condition format as DoD (bare built-in names, `run:` shell commands, parameterised built-ins)
5. If all conditions pass: system allows the commit to proceed
6. If any conditions fail: system prints all failures with corrections and blocks the commit

## Alternate Flows
### Re-implementing a completed behaviour
- **Trigger:** A `complete` `impl.md` already exists under the same behaviour
- **Steps:**
  1. System warns: "An implementation already exists at `<path>` with state: complete — is this a replacement?"
  2. Commit is allowed to proceed (warning only, not a block)

### No `definitionOfReady` configured
- **Trigger:** `.taproot.yaml` has no `definitionOfReady` section
- **Steps:**
  1. System runs baseline checks only
  2. No additional conditions are evaluated

## Postconditions
- If passed: the behaviour spec is formally declared ready; implementation work may begin
- If blocked: contributor has a full list of failures with corrections; no implementation record is created until the spec is brought up to standard

## Error Conditions
- **`usecase.md` not found**: `FAIL — no behaviour spec at <path>/usecase.md. Create one with /tr-behaviour before committing an impl.md`
- **State is not `specified`**: `FAIL — usecase.md state is '<current-state>'. Bring the spec to 'specified' (run /tr-grill then /tr-refine) before starting implementation`
- **`validate-format` violations**: `FAIL — usecase.md has format violations: <list>. Fix them and re-commit`
- **Mermaid diagram missing**: `FAIL — usecase.md has no ## Flow section with a Mermaid diagram. Add one before starting implementation`
- **Related section missing**: `FAIL — usecase.md has no ## Related section. Document related behaviours before starting implementation`
- **Custom DoR condition fails**: correction from the condition's `correction:` field or stdout/stderr of the failed command

## Flow
```mermaid
sequenceDiagram
    participant Agent
    participant Hook as taproot commithook
    participant DoR as DoR Checker
    participant Spec as usecase.md

    Agent->>Hook: git commit (impl.md, no source files)
    Hook->>DoR: classify → DoR commit
    DoR->>Spec: read parent usecase.md
    alt usecase.md missing
        DoR-->>Hook: FAIL — no behaviour spec
    else state not specified
        DoR-->>Hook: FAIL — not ready
    else format / Mermaid / Related invalid
        DoR-->>Hook: FAIL — spec incomplete
    else configured DoR conditions fail
        DoR-->>Hook: FAIL — custom condition
    else all pass
        DoR-->>Hook: PASS
        Hook-->>Agent: commit accepted
    end
```

## Related
- `../definition-of-done/usecase.md` — companion gate: DoD runs on the implementation commit (source + impl.md); DoR baseline is a precondition for DoD
- `../../hierarchy-integrity/pre-commit-enforcement/usecase.md` — the hook that invokes DoR as one of its three commit-type tiers
- `../../hierarchy-integrity/validate-format/usecase.md` — DoR delegates format checking to validate-format as part of its baseline

## Implementations <!-- taproot-managed -->
- [CLI Command — taproot commithook (DoR tier)](./cli-command/impl.md)


## Status
- **State:** implemented
- **Created:** 2026-03-19
- **Last verified:** 2026-03-19
