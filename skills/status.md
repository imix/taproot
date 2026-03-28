# Skill: status

## Description

Generate a health dashboard for the requirement hierarchy. Combines `taproot coverage`, `taproot check-orphans`, and `taproot sync-check` into a synthesized narrative summary with actionable next steps.

## Inputs

- `path` (optional): Path to scope the report to a subtree. Defaults to `taproot/`.

## Steps

1. Run `taproot coverage --path <path> --format json` and parse the output. Key fields: `totals.behaviours`, `totals.implementations`, `totals.completeImpls`, `totals.testedImpls`, `totals.deferredBehaviours`, `totals.deferredImpls`. Use `deferredBehaviours` and `deferredImpls` to populate the **Parked** section; omit the section entirely if both are zero.

2. Run `taproot check-orphans --path <path> --include-unimplemented` and collect violations.

3. Run `taproot sync-check --path <path>` and collect warnings.

4. Run `taproot validate-structure --path <path>` and `taproot validate-format --path <path>`. Any errors here are top-priority — flag them before the narrative.

5. Synthesize into a structured report:

```
# Taproot Status Report
Generated: <date>

## Validation
✓ Structure valid  |  ✗ 2 format errors (fix these first)

## Coverage
<N> intents · <N> behaviours · <N> implementations
█████████░░░ <N>/<N> implementations complete
█████████░░░ <N>/<N> implementations with tests

## What's Working
- Intent "<name>": all <N> behaviours implemented and tested ✓
- Behaviour "<name>": <N>/<N> implementations complete ✓

## What Needs Attention
- <N> behaviours specified but not implemented:
    · taproot/<intent>/<behaviour>/ [proposed since <date>]
- <N> implementations missing tests:
    · taproot/<path>/impl.md ⚠
- <N> potentially stale specs (code changed after spec):
    · taproot/<path>/impl.md — source file modified <N> days ago

## Parked
- <N> behaviours deferred: (omit section entirely if 0)
    · taproot/<intent>/<behaviour>/ — <reason if provided>
- <N> implementations deferred:
    · taproot/<path>/impl.md — <reason if provided>

## Structural Issues
- <from check-orphans>

## Suggested Next Actions
1. Fix format errors: `taproot validate-format --fix`
2. Implement next behaviour: `/taproot:implement taproot/<path>/`
3. Add tests to: `/taproot:refine taproot/<path>/`
4. Review stale spec: `/taproot:refine taproot/<path>/`
```

6. Prioritize suggestions by severity:
   - Validation errors first (broken structure/format)
   - Orphaned or broken references second
   - Unimplemented behaviours third (sorted by how long they've been in `proposed` state)
   - Missing tests fourth
   - Stale specs fifth

7. If no issues are found: "Everything looks healthy. <N> intents, <N> behaviours, <N> implementations — all valid, complete, and tested."

   Present next steps based on what was found:

   - **If specific priority items were found** (unimplemented behaviours, missing tests, validation errors): surface the top 1–2 as direct lettered options with the exact command and path pre-filled. Add one generic fallback option last. Example:

     **What's next?**
     [A] `/tr-implement taproot/<intent>/<behaviour>/` — implement unimplemented behaviour
     [B] `/tr-refine taproot/<intent>/<behaviour>/` — add missing tests
     [C] `/tr-next` — pick a different next item

   - **If no specific items were found** (healthy project): check whether `taproot/backlog.md` exists and contains items. Show the generic fallback menu:

     **What's next?**
     [A] `/tr-next` — pick the next behaviour to implement
     [B] `/tr-ineed` — route a new requirement into the hierarchy
     [C] `/tr-review-all` — deeper semantic review of specs
     [D] `/tr-backlog` — triage captured ideas (only if `taproot/backlog.md` is non-empty)

## Output

A narrative health summary with metrics, issue categorization, and prioritized action list.

## CLI Dependencies

- `taproot coverage`
- `taproot check-orphans`
- `taproot sync-check`
- `taproot validate-structure`
- `taproot validate-format`

## Notes

- This skill is read-only. It reports, it does not modify.
- For deep semantic issues (unclear specs, over-scoped intents), this skill will not catch them — suggest `/taproot:review-all` for that.
