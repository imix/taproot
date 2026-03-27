# Discussion: CLI Command (DoR hook check)

## Session
- **Date:** 2026-03-25
- **Skill:** tr-implement

## Pivotal Questions

**Should `require-discussion-log` be a DoR condition or a DoD condition?**
DoR — it checks that the deliberation record is committed at declaration time, not at implementation completion. DoD runs after source code is written; by then the discussion should already exist. Placing it in `definitionOfReady` is consistent with the intent: "before you start coding, prove the session was captured."

**Should the check validate content or only existence?**
Existence only. Content quality cannot be reliably machine-checked — a skeleton file with correct headings but no substance would pass any structural check. The spec explicitly accepts this trade-off: "quality review is a human responsibility." An existence check is sufficient to enforce the habit and is consistent with how DoD's `document-current` condition works.

## Alternatives Considered

- **Separate `DorConditionEntry` type** — rejected because `DodConditionEntry` is already shared between both DoD and DoR config arrays. Adding a separate type would require forking the config schema and duplicating the YAML parsing logic.
- **Validate `discussion.md` content (four sections present)** — rejected per spec. The hook cannot reliably distinguish a genuinely minimal session from a lazily filled-in template. Existence check + human review is the right boundary.
- **DoD condition instead of DoR** — rejected. DoD runs at implementation commit time. A DoD check would mean discussion.md could be written *after* coding was done, which defeats the purpose of capturing deliberation *before* implementation begins.

## Decision

Implemented as a new `DodConditionEntry` variant (`require-discussion-log: boolean`) handled in `dor-runner.ts`'s `dorConditions` loop. The handler performs a simple `existsSync` check on `<impl-dir>/discussion.md`. The `dod-runner.ts` `resolveCondition` function also got a case to handle the type safely (it marks the entry as `agentCheck: true`, so it never runs as a shell command in the DoD flow). AC-4 (settings error doesn't block) is satisfied structurally: if `loadConfig` fails, the loop body never executes.

## Open Questions
- None.
