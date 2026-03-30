# Implementation: CLI Command — taproot init

## Behaviour
../usecase.md

## Design Decisions
- Interactive checkbox prompt (via `@inquirer/checkbox`) lets developers pick agent adapters at init time — avoids a required argument for the most common case
- `--agent all` shorthand installs all supported adapters in one shot
- `taproot/settings.yaml` is generated with commented defaults rather than a minimal file — aids discoverability for first-time users
- Skills are installed to `taproot/agent/skills/` at init time so agents can load them locally without internet access

## Source Files
- `src/commands/init.ts` — CLI command registration, directory scaffolding, config generation, skill installation, adapter generation
- `src/templates/index.ts` — template strings for `intent.md`, `usecase.md`, and `impl.md`
- `src/adapters/index.ts` — adapter generation logic invoked by init

## Commits
- (run `taproot link-commits` to populate)
- `54099d6756fa4c3afe2a505dfc4e23484e226139` — (auto-linked by taproot link-commits)
- `fa9623b61aef8c8654cbae280f470b0ceb92e0dd` — (auto-linked by taproot link-commits)
- `84a6dfbc2f3c62e87ff88b7a111303834bdc09d0` — (auto-linked by taproot link-commits)
- `d5ec52a5c1218c23dffc90af78b1061cf6678c7a` — (auto-linked by taproot link-commits)
- `cbc7888f34f8ec363ecbc10d0a4cf4abf31f48ed` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/init.test.ts` — scaffolding, config generation, skill installation, hook installation, adapter generation

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-03-27

## DoD Resolutions
- condition: gemini-toml-fix | note: src/adapters/index.ts updated to fix Gemini TOML format — removed invalid [command] section and name field; top-level prompt and description only. | resolved: 2026-03-21
- condition: check-if-affected: package.json | note: Prompt text change only — no new dependencies, scripts, or version bump required. package.json unaffected. | resolved: 2026-03-29T08:20:21.414Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: NO — appending .taproot/ to .gitignore is a one-time init-only operation; taproot update explicitly does not touch .gitignore (per spec Notes). No new cross-cutting concern warranted. | resolved: 2026-03-27T20:41:00.722Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: NO skill files modified. | resolved: 2026-03-27T16:56:36.392Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: NO. | resolved: 2026-03-27T16:56:36.128Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: NO. | resolved: 2026-03-27T16:56:35.871Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — adding one field to configForYaml object in init.ts, no architectural concerns. | resolved: 2026-03-27T16:56:35.610Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable. | resolved: 2026-03-27T16:56:35.338Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable. | resolved: 2026-03-27T16:56:35.073Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable. | resolved: 2026-03-27T16:56:34.806Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable. | resolved: 2026-03-27T16:56:34.543Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable. | resolved: 2026-03-27T16:56:34.281Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: not applicable — source code. | resolved: 2026-03-27T16:56:34.012Z

- condition: check-if-affected: examples/ | note: examples' settings templates would benefit from cli: but they're typically overwritten by init; acceptable as-is. | resolved: 2026-03-27T16:56:33.748Z

- condition: check-if-affected: docs/ | note: not affected — cli: already documented. | resolved: 2026-03-27T16:56:33.476Z

- condition: check-if-affected: skills/guide.md | note: not affected. | resolved: 2026-03-27T16:56:33.210Z

- condition: check-if-affected: src/commands/update.ts | note: not affected by this init.ts change. | resolved: 2026-03-27T16:56:32.947Z

- condition: document-current | note: REWORK: init.ts settings template gains cli: ./taproot/agent/bin/taproot so new projects get the wrapper by default. | resolved: 2026-03-27T16:56:32.683Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: this change modifies src/commands/init.ts and test/integration/init.test.ts — neither is a skill file; not applicable | resolved: 2026-03-27T09:38:12.283Z

- condition: check-if-affected: examples/ | note: examples demonstrate hierarchy structure and init output — internal validation ordering is not user-visible; not affected | resolved: 2026-03-27T09:38:10.962Z

- condition: check-if-affected: docs/ | note: docs/ does not document internal validation ordering — no new CLI options or user-visible output changes; not affected | resolved: 2026-03-27T09:38:05.153Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: COMPLIANT — src/adapters/index.ts changes add buildConfigQuickRef() (generic language only) and per-adapter reference files. Adapter-specific files (.claude/commands/, .gemini/commands/) are explicitly excluded from the agent-agnostic-language standard per its Scope section. | resolved: 2026-03-24T14:50:47.064Z

- condition: gemini-skills-install | note: src/commands/init.ts updated so gemini agent triggers skill installation (needsSkills includes 'gemini'). test/integration/init.test.ts updated with test asserting skills are installed for gemini. | resolved: 2026-03-21
- condition: no-git-abort | note: AC-13 implemented — runInit throws if .git absent. test/integration/init.test.ts: AC-13 test added. test/integration/adapters.test.ts, phase5.test.ts: beforeEach updated to create .git. | resolved: 2026-03-21
- condition: sweep-update | note: src/adapters/index.ts updated to add 'sweep' to TREE_MODIFYING_SKILLS; src/commands/init.ts updated to add 'sweep.md' to SKILL_FILES — both changes required for /tr-sweep skill distribution via taproot update | resolved: 2026-03-20T16:00:00.000Z
- condition: check-if-affected-by: skill-architecture/commit-awareness | note: taproot init is a CLI command, not a skill file — commit-awareness constraints govern skills/*.md files that contain git commit steps. Not applicable. | resolved: 2026-03-21T07:47:18.616Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — skill distribution via SKILL_FILES + taproot update is already the established pattern; no new pattern to document | resolved: 2026-03-20T16:05:55.514Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: no — taproot init already has all relevant cross-cutting checks; sweep skill distribution is an extension of the existing pattern, not a new concern | resolved: 2026-03-20T16:05:55.280Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — taproot init is a stateless CLI command; all I/O at command boundaries; no global mutable state; validation before filesystem writes; error messages are actionable | resolved: 2026-03-20T16:05:55.047Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — pattern-hints governs agent skills that process user needs; taproot init is a non-interactive CLI command | resolved: 2026-03-20T16:05:54.813Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — context-engineering governs skill files (skills/*.md); taproot init is a CLI command | resolved: 2026-03-20T16:05:54.579Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — taproot init is a CLI command; pause-and-confirm governs bulk-authoring agent skills | resolved: 2026-03-20T16:05:54.343Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — taproot init/update are CLI setup commands, not agent skills; contextual-next-steps governs skills that produce primary output | resolved: 2026-03-20T16:05:54.106Z

- condition: check-if-affected: skills/guide.md | note: guide.md updated with /tr-sweep row in Slash Commands table as part of sweep skill distribution | resolved: 2026-03-20T16:05:53.870Z

- condition: check-if-affected: src/commands/update.ts | note: not affected — update.ts reads SKILL_FILES from init.ts dynamically; sweep.md entry in SKILL_FILES is sufficient | resolved: 2026-03-20T16:05:53.634Z

- condition: document-current | note: docs/agents.md and skills/guide.md updated with /tr-sweep — all CLI commands and skills remain accurately documented | resolved: 2026-03-20T16:05:53.399Z
- condition: agent-support-tiers | note: src/adapters/index.ts updated to add AGENT_TIERS static map and getTierLabel helper. Not a behavioral change to taproot init scaffolding — tier data co-located with adapter definitions. Not applicable to this init CLI implementation. | resolved: 2026-03-21

