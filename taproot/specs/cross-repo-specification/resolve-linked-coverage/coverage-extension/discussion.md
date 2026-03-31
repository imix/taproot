# Discussion: coverage extension

## Session
- **Date:** 2026-03-31
- **Skill:** tr-implement

## Pivotal Questions

**How should link files be associated with their parent hierarchy level?**
Two options: (A) use `findLinkFiles()` which walks the full tree and then derive the parent from the path; (B) scan each node's immediate directory during the normal hierarchy traversal. Option B was chosen — it keeps link file discovery co-located with the node it belongs to and avoids confusion when a link file sits alongside both a usecase.md and impl subfolders (the link is at the behaviour level, not the impl level).

**Should the coverage count depend on link resolution (repos.yaml)?**
The spec explicitly says no (AC-4): "coverage is counted based on local impl.md state only". This is the right call — requiring repos.yaml for coverage would break CI environments. The `warnUnresolvable` flag is decoration only; the counts are purely derived from local impl.md state.

**How to handle intent-type links?**
The current coverage report has no "intent coverage" concept — intents aren't "implemented", only behaviours are. Intent-type links are counted in a new `linkedIntents` total and displayed at the intent level in the tree/markdown output. They don't affect the existing behaviour/impl percentage.

## Alternatives Considered

- **Recursive link scan per node** — rejected because it would double-count link files in nested folders (e.g. a link.md in a behaviour folder would also be found when scanning the parent intent).
- **Adding a new `FolderNode` marker for link-only folders** — rejected as over-engineering; a folder with only a link.md is not a full behaviour spec, just a reference.

## Decision
Scan each node's immediate directory for link files, check impl child nodes for Source Files mentions, and separate intent-type links into a distinct counter. Coverage counting is fully local — no dependency on repos.yaml resolution.

## Open Questions
- None. All ACs are addressed by this implementation.
