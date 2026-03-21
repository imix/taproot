# Implementation: CLI Command — taproot init

## Behaviour
../usecase.md

## Design Decisions
- Interactive checkbox prompt (via `@inquirer/checkbox`) lets developers pick agent adapters at init time — avoids a required argument for the most common case
- `--agent all` shorthand installs all supported adapters in one shot
- `.taproot/settings.yaml` is generated with commented defaults rather than a minimal file — aids discoverability for first-time users
- Skills are installed to `taproot/skills/` at init time so agents can load them locally without internet access

## Source Files
- `src/commands/init.ts` — CLI command registration, directory scaffolding, config generation, skill installation, adapter generation
- `src/templates/index.ts` — template strings for `intent.md`, `usecase.md`, and `impl.md`
- `src/adapters/index.ts` — adapter generation logic invoked by init

## Commits
- (run `taproot link-commits` to populate)
- `54099d6756fa4c3afe2a505dfc4e23484e226139` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/init.test.ts` — scaffolding, config generation, skill installation, hook installation, adapter generation

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-03-21

## DoD Resolutions
- condition: sweep-update | note: src/adapters/index.ts updated to add 'sweep' to TREE_MODIFYING_SKILLS; src/commands/init.ts updated to add 'sweep.md' to SKILL_FILES — both changes required for /tr-sweep skill distribution via taproot update | resolved: 2026-03-20T16:00:00.000Z
- condition: check-if-affected-by: skill-architecture/commit-awareness | note: taproot init is a CLI command, not a skill file — commit-awareness constraints govern skills/*.md files that contain git commit steps. Not applicable. | resolved: 2026-03-21T07:47:18.616Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — skill distribution via SKILL_FILES + taproot update is already the established pattern; no new pattern to document | resolved: 2026-03-20T16:05:55.514Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: no — taproot init already has all relevant cross-cutting checks; sweep skill distribution is an extension of the existing pattern, not a new concern | resolved: 2026-03-20T16:05:55.280Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — taproot init is a stateless CLI command; all I/O at command boundaries; no global mutable state; validation before filesystem writes; error messages are actionable | resolved: 2026-03-20T16:05:55.047Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — pattern-hints governs agent skills that process user needs; taproot init is a non-interactive CLI command | resolved: 2026-03-20T16:05:54.813Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — context-engineering governs skill files (skills/*.md); taproot init is a CLI command | resolved: 2026-03-20T16:05:54.579Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — taproot init is a CLI command; pause-and-confirm governs bulk-authoring agent skills | resolved: 2026-03-20T16:05:54.343Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — taproot init/update are CLI setup commands, not agent skills; contextual-next-steps governs skills that produce primary output | resolved: 2026-03-20T16:05:54.106Z

- condition: check-if-affected: skills/guide.md | note: guide.md updated with /tr-sweep row in Slash Commands table as part of sweep skill distribution | resolved: 2026-03-20T16:05:53.870Z

- condition: check-if-affected: src/commands/update.ts | note: not affected — update.ts reads SKILL_FILES from init.ts dynamically; sweep.md entry in SKILL_FILES is sufficient | resolved: 2026-03-20T16:05:53.634Z

- condition: document-current | note: docs/agents.md and skills/guide.md updated with /tr-sweep — all CLI commands and skills remain accurately documented | resolved: 2026-03-20T16:05:53.399Z

