# Discussion: validate-format extension

## Session
- **Date:** 2026-03-31
- **Skill:** tr-implement

## Pivotal Questions

1. **Where does link file validation belong — validate-format or a new command?** validate-format already validates all taproot-managed files. Adding link files there keeps the workflow consistent: developers get format errors from the same command they use for everything else. A new command would fragment the developer experience.

2. **How much should the format validator check?** Options: (a) presence only, (b) presence + URL format for Repo, (c) presence + full semantic validation. Chose (b): check presence of all three required fields and validate that Type is one of the allowed values. URL format for Repo is left loose (any non-empty string) — enforcing full URL syntax in a format validator adds friction without preventing real mistakes.

## Alternatives Considered

- **Separate `taproot validate-links` command** — rejected; adds CLI surface area for what is fundamentally a format check. One command, one concern.
- **Full URL regex validation for Repo field** — rejected; overly strict for a format check, and different teams may use non-GitHub URLs or SSH remotes.

## Decision

Extend `runValidateFormat()` with a second pass that calls `findLinkFiles()`, parses each link file, and reports `LINK_MISSING_FIELD` or `LINK_INVALID_TYPE` violations. Extend `checkLinkTargets()` in check-orphans to read the state of resolved targets and emit `LINK_TARGET_DRAFT` when the target is in `proposed` state.

## Open Questions
- None.
