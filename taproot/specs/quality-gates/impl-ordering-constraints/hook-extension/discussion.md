# Discussion: Hook Extension — depends-on ordering check in DoR

## Session
- **Date:** 2026-03-26
- **Skill:** tr-implement

## Pivotal Questions

**Where should `depends-on` live in `impl.md`?**
Considered YAML front matter (like many tools use for metadata) vs a markdown `## Depends On` section. Chose the section approach for consistency — taproot's `impl.md` format uses markdown sections throughout, and adding a mixed YAML front matter would require a new parser. The section is also visible in the rendered markdown without special tooling.

**Should cycle detection be required at the first implementation?**
Yes — without cycle detection, a circular `depends-on` graph would cause infinite recursion in the check. Added iterative DFS rather than recursive to avoid stack overflow on deep chains.

## Alternatives Considered

- **YAML front matter for `depends-on`** — rejected because `impl.md` has no existing front matter convention; adding it would require changes to the markdown parser and all downstream tools that read impl.md
- **Inline check in `commithook.ts` rather than `dor-runner.ts`** — rejected because `runDorChecks()` is the right abstraction level; the hook delegates to it for all DoR logic

## Decision

The `depends-on` field uses a `## Depends On` markdown section in `impl.md`, normalised to a string array by `parseImplData()`. The ordering check runs inside `runDorChecks()` after baseline section checks. Cycle detection is iterative DFS that reports the full cycle path. All failures are collected before reporting.

## Open Questions
- None
