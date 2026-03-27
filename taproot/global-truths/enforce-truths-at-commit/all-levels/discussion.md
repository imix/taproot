# Discussion: All Levels

## Session
- **Date:** 2026-03-27
- **Skill:** tr-implement

## Pivotal Questions

1. **Where should truth session validation live in the hook?** Originally it was inside the `requirement` tier block. Moving it to a unified block was needed because a single session hash must cover all staged docs — hierarchy docs for requirement commits, impl.md + source paths for implementation commits. Separate per-tier validation would compute different expected hashes from the same session file.

2. **What to include in the session hash for source files?** Including full source file content would mean re-signing after every code edit. Including only file paths (as a sorted list) is sufficient to anchor the session to the staged file set while staying consistent with the agent's semantic review model (the agent reviews meaning, not bytes).

## Alternatives Considered

- **Per-tier session files** — a separate `.truth-check-session-impl` for implementation commits. Rejected: doubles the signing workflow without benefit; one session covering all staged content is simpler and sufficient.
- **Hash source file content** — more precise but breaks UX: any edit after staging requires re-signing. Path-as-identity is the right tradeoff.

## Decision

Unified truth session block at the end of `runCommithook`. `truth-sign` extended symmetrically. The session hash covers whatever is staged: hierarchy docs (content), impl.md (content), source files (path list). No behavioral change for existing requirement commits — all 34 pre-existing tests pass unchanged.

## Open Questions
- None.
