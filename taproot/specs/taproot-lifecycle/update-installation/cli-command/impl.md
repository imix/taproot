# Implementation: CLI Command — taproot update

## Behaviour
../usecase.md

## Design Decisions
- The same `taproot update` command serves both the lifecycle maintenance use case (version migrations, stale cleanup) and the adapter refresh use case — a single entry point keeps the developer experience simple
- Stale path detection is forward-compatible: new old-paths can be added to the `STALE_PATHS` list in a future version and will be cleaned on the next `taproot update` run
- Skills are always refreshed when a Claude adapter is detected; for other agents, skills are refreshed only if already installed — avoids installing skills that weren't opted into
- `--with-hooks` installs `.git/hooks/pre-commit` (as `taproot commithook`) if it doesn't already exist; reports `exists` if already present
- Old hook content (`validate-structure`/`validate-format`) is auto-detected and migrated to `taproot commithook` unconditionally during `removeStale()` — no flag required, treated as a stale artefact
- Docs are distributed to `.taproot/docs/` (not `docs/`) — keeps taproot-managed content under `.taproot/`, avoids polluting the user project's `docs/` folder; `installDocs()` copies all `.md` files from the bundled `docs/` directory with no allowlist (all docs are relevant agent reference material)

## Source Files
- `src/commands/update.ts` — stale removal, adapter regeneration, skill + docs refresh, overview regeneration
- `src/commands/init.ts` — `installDocs()` function + `BUNDLED_DOCS_DIR` constant; called from `runInit()` and imported by `update.ts`
- `package.json` — `"docs/"` added to `files` so docs are included in the published npm package

## Commits
- (run `taproot link-commits` to populate)
- `dd611364ccbb767f137428767e640389cf7f3a6e` — (auto-linked by taproot link-commits)
- `915ae8a7d58c295b38583a0242364edf95f91aea` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/update.test.ts` — covers stale path removal, idempotency, hook migration from old content, --with-hooks install, --with-hooks exists; docs installation to .taproot/docs/, docs refresh on re-run

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-03-24
- condition: fix-update-skill-overwrite | note: update.ts now calls installSkills(skillsDir, true) — force=true overwrites existing taproot/agent/skills/ files so package updates are reflected; init still uses force=false (create-only) | resolved: 2026-03-20

## DoD Resolutions
- condition: document-current | note: no docs change needed — force-overwrite of skills on update is an internal implementation detail; README and docs/agents.md describe what taproot update does (refreshes skills), not how it detects changes | resolved: 2026-03-20T20:55:08.050Z
- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: no — moving taproot_version to the top of settings.yaml is a cosmetic layout change; it does not introduce a new architectural rule for other implementations | resolved: 2026-03-28T10:45:52.209Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: NO skill files modified. | resolved: 2026-03-27T16:53:31.086Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: NO. | resolved: 2026-03-27T16:53:30.824Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: NO — one-shot migration, not an ongoing concern. | resolved: 2026-03-27T16:53:30.565Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — setCliWrapper is stateless, reads settings, writes one field, no side effects. | resolved: 2026-03-27T16:53:30.303Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable. | resolved: 2026-03-27T16:53:30.043Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — no skill files. | resolved: 2026-03-27T16:53:29.769Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — no skill files. | resolved: 2026-03-27T16:53:29.510Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable. | resolved: 2026-03-27T16:53:29.253Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — source code. | resolved: 2026-03-27T16:53:28.977Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: not applicable — source code only. | resolved: 2026-03-27T16:53:28.719Z

- condition: check-if-affected: examples/ | note: not affected. | resolved: 2026-03-27T16:53:28.458Z

- condition: check-if-affected: docs/ | note: not affected — cli: already documented. | resolved: 2026-03-27T16:53:28.197Z

- condition: check-if-affected: skills/guide.md | note: not affected. | resolved: 2026-03-27T16:53:27.932Z

- condition: check-if-affected: src/commands/update.ts | note: PRIMARY file — setCliWrapper() added. | resolved: 2026-03-27T16:53:27.674Z

- condition: document-current | note: REWORK: update.ts gains setCliWrapper() — adds cli: ./taproot/agent/bin/taproot to settings.yaml on new-layout projects where cli: is absent. Runs after bumpTaprootVersion. | resolved: 2026-03-27T16:53:27.411Z

- condition: check-if-affected: examples/ | note: not affected — examples/ was reviewed in prior implementations. This rework makes no changes requiring example updates. | resolved: 2026-03-27T16:30:31.869Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: Not applicable. No skills/*.md files were modified. | resolved: 2026-03-24T19:31:23.642Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: No. Bundled directory distribution is a standard file copy pattern, not a taproot-specific architectural pattern. | resolved: 2026-03-24T19:31:22.382Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: Yes — added check-if-affected: docs/ to settings.yaml so any future docs/ addition is reviewed for distribution suitability. | resolved: 2026-03-24T19:31:21.127Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: Compliant. installDocs() mirrors installSkills() architecture: BUNDLED_DOCS_DIR resolved from __dirname, no global state, function receives target path as parameter. | resolved: 2026-03-24T19:31:19.896Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: Not applicable. CLI command that copies files; does not route user requirements. | resolved: 2026-03-24T19:31:18.567Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: Not applicable. CLI command; commit-awareness governs skill prompts. | resolved: 2026-03-24T19:31:17.302Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: Not applicable. CLI command implementation, not a skill file. | resolved: 2026-03-24T19:31:16.083Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: Not applicable. Non-interactive CLI command. | resolved: 2026-03-24T19:31:14.774Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: Not applicable. Non-interactive CLI command, no conversational output. | resolved: 2026-03-24T19:31:13.077Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: Not applicable. CLI source code — agent-agnostic-language applies to skill markdown files only. | resolved: 2026-03-24T19:31:11.814Z

- condition: check-if-affected: docs/ | note: docs/cli.md updated — taproot update section mentions .taproot/docs/ refresh. | resolved: 2026-03-24T19:31:10.553Z

- condition: check-if-affected: skills/guide.md | note: Not affected. skills/guide.md documents user-facing /tr-* commands, not taproot CLI internals. | resolved: 2026-03-24T19:31:09.335Z

- condition: check-if-affected: src/commands/update.ts | note: update.ts is a primary source file — now calls installDocs(join(cwd, '.taproot', 'docs'), true) alongside installSkills() in the refresh block. | resolved: 2026-03-24T19:31:08.083Z

- condition: document-current | note: docs/cli.md updated — taproot update section now mentions .taproot/docs/ refresh. No README changes needed. | resolved: 2026-03-24T19:31:06.863Z


- condition: check-if-affected-by: quality-gates/architecture-compliance | note: STILL COMPLIANT — vocabulary pass added to update.ts follows same architecture as language pack: config loaded once, passed down, empty-value check at command boundary before any I/O. | resolved: 2026-03-24T13:11:54.451Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: NOT APPLICABLE — this implementation is taproot CLI source code (src/commands/update.ts). agent-agnostic-language applies to shared skill and spec markdown files. No implicit Claude assumptions or @{project-root} syntax in this implementation. | resolved: 2026-03-23T12:22:35.339Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — create-only vs force-overwrite is a standard copy pattern; no new reusable pattern | resolved: 2026-03-20T20:55:10.380Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: no — skill force-overwrite is specific to the update command; no new architectural constraint | resolved: 2026-03-20T20:55:10.150Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — force parameter added to installSkills follows existing patterns: no global state, parameter passed down, no I/O in core logic | resolved: 2026-03-20T20:55:09.912Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — taproot update is a CLI command, not a skill that routes user requirements | resolved: 2026-03-20T20:55:09.683Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — taproot update is a CLI command; commit-awareness governs skill prompts, not CLI source code | resolved: 2026-03-20T20:55:09.453Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — this is a CLI command implementation, not a skill file | resolved: 2026-03-20T20:55:09.218Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — taproot update is a CLI command, not a multi-document authoring skill | resolved: 2026-03-20T20:55:08.985Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — taproot update is a non-interactive CLI command, not an agent skill with a What's next? block | resolved: 2026-03-20T20:55:08.747Z

- condition: check-if-affected: skills/guide.md | note: not affected — guide.md describes what /tr-update does for users, not the internal copy logic | resolved: 2026-03-20T20:55:08.517Z

- condition: check-if-affected: src/commands/update.ts | note: update.ts is the source file changed; now calls installSkills(skillsDir, true) to force-overwrite skills on update | resolved: 2026-03-20T20:55:08.282Z
- condition: verified-unaffected-by: configuration-discoverability CONFIGURATION.md addition | note: buildConfigurationMd() call added to update.ts is unrelated to stale-path removal, hook migration, and version migration logic owned by this behaviour. Lifecycle behaviour unchanged. | resolved: 2026-03-24

