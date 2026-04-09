# Implementation: CLAUDE.md — Pre-Commit Ownership Scan

## Behaviour
../usecase.md

## Design Decisions
- Implemented as a CLAUDE.md instruction rather than a skill step — this covers ad-hoc agent work that happens outside any taproot skill; CLAUDE.md is the right surface for persistent agent-level guidance
- Uses `grep -rl` scan rather than reading every impl.md — consistent with the spec's C-2 concern about O(N) reads in large hierarchies
- Announcement step (step 3) makes the scan transparent — developer sees why extra files appear in the commit
- Same content-proxy test pattern as `commit-awareness/multi-surface` — tests verify instruction phrases are present in CLAUDE.md

## Source Files
- `CLAUDE.md` — "Committing" section: single `/tr-commit` trigger replacing the previous manual scan procedure
- `skills/commit.md` — the full commit procedure (ownership scan, gate resolution, all commit types) now lives here

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/unit/claude-md.test.ts` — AC-1: CLAUDE.md contains /tr-commit trigger; AC-2: trigger covers both proactive and conversational commit intent

## Status
- **State:** complete
- **Created:** 2026-03-20
- **Last verified:** 2026-04-09

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — implementation is a CLAUDE.md markdown addition; no source code modified; no architectural constraints affected | resolved: 2026-03-20

## DoD Resolutions
- condition: document-current | note: CLAUDE.md is the documentation surface for this behaviour — it IS the implementation. README.md and docs/ describe CLI commands and skills at a high level; pre-commit agent guidance belongs in CLAUDE.md, not in docs/ | resolved: 2026-03-20T21:09:02.487Z
- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — the grep-scan-before-commit pattern is specific to this CLAUDE.md instruction; it is not a general taproot spec pattern applicable to other implementations | resolved: 2026-03-20T21:09:04.835Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: no — ad-hoc commit prep is specific to Claude Code agent guidance in CLAUDE.md; it does not introduce a new architectural constraint that should gate future skill implementations | resolved: 2026-03-20T21:09:04.603Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: not applicable — architecture-compliance governs CLI source code; CLAUDE.md is a markdown instruction file with no source code | resolved: 2026-03-20T21:09:04.372Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — CLAUDE.md is a persistent instruction file; pattern-hints applies to skills that receive natural language descriptions and check docs/patterns.md at step 0 | resolved: 2026-03-20T21:09:04.133Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: compliant by design — this implementation IS ad-hoc-commit-prep; CLAUDE.md now instructs the agent to run git status, grep scan, taproot dod, and stage impl.md files proactively before any commit | resolved: 2026-03-20T21:09:03.890Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — context-engineering governs skill file design (description length, section loading, etc.); CLAUDE.md is not a skill file | resolved: 2026-03-20T21:09:03.657Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — CLAUDE.md guidance describes a scan-and-stage flow, not a multi-document authoring skill | resolved: 2026-03-20T21:09:03.424Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — CLAUDE.md is a persistent instruction file, not a skill with a What's next? block | resolved: 2026-03-20T21:09:03.191Z

- condition: check-if-affected: skills/guide.md | note: not affected — guide.md documents skills (/tr-xxx commands); ad-hoc commit guidance belongs in CLAUDE.md, not the skill guide | resolved: 2026-03-20T21:09:02.952Z

- condition: check-if-affected: src/commands/update.ts | note: not affected — CLAUDE.md is a project-level instruction file, not distributed via taproot update; update.ts copies skill files only | resolved: 2026-03-20T21:09:02.717Z

