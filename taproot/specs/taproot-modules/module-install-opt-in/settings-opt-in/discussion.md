# Discussion: Settings Opt-In

## Session
- **Date:** 2026-04-11
- **Skill:** tr-implement

## Pivotal Questions

**Should module skills stay in SKILL_FILES with a filter, or be removed entirely?**
Removing them from `SKILL_FILES` is cleaner — the constant should only list skills that are always installed. A filter approach would leave ghost entries in the array and make the list's intent ambiguous. `MODULE_SKILL_FILES` is the right home for module-specific lists.

**Where should removal logic live — `installSkills()` or a new function?**
A new `installModuleSkills()` function keeps the two concerns orthogonal. `installSkills()` handles core skills (always installed); `installModuleSkills()` handles declared-module skills (conditionally installed + removed). Mixing removal into `installSkills()` would add a module-awareness concern to a function that was never module-aware.

## Alternatives Considered
- **Filter SKILL_FILES at call site** — rejected; `SKILL_FILES` would still contain module entries that aren't installed by default, misleading future maintainers.
- **Separate `module-registry.ts` file** — rejected for this first module; the `MODULE_SKILL_FILES` constant fits cleanly in `init.ts` alongside `SKILL_FILES`. Extract if the number of modules grows.
- **Remove files via git** vs **unlinkSync** — unlinkSync is the right choice; `taproot update` owns the skill files in `taproot/agent/skills/` and managing them outside git is consistent with how all skill updates work.

## Decision
Move UX skill files out of `SKILL_FILES` into a new `MODULE_SKILL_FILES` record. Add `installModuleSkills()` to handle install + removal based on `config.modules`. Wire into both `runUpdate()` and `runInit()` (via `needsSkills` path). Validate module names before installing and report unknowns.

## Open Questions
- When multiple modules exist, should `taproot update` report a summary ("2 modules active: user-experience, security") at the top? Deferred to a future iteration.
