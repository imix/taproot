# Implementation: CLI Command — taproot init --agent

## Behaviour
../usecase.md

## Design Decisions
- Each adapter generator is a standalone function — adding a new agent requires one new generator function plus an entry in `ALL_AGENTS`; no changes to the dispatch logic
- Claude adapter uses a "thin launcher" pattern: each `.claude/commands/tr-*.md` file contains only a brief prompt that instructs the agent to load the full skill from `taproot/skills/` — keeps adapters small and ensures skill updates flow through without regenerating adapters
- Copilot/Windsurf/generic adapters use `<!-- TAPROOT:START/END -->` markers for idempotent injection into potentially pre-existing files — preserves any non-taproot content in those files
- Skill descriptions (used in adapter indexes) are extracted from the first sentence of each skill's `## Description` section

## Source Files
- `src/adapters/index.ts` — all adapter generators (`generateClaudeAdapter`, `generateCursorAdapter`, `generateCopilotAdapter`, `generateWindsurfAdapter`, `generateGenericAdapter`)
- `src/commands/init.ts` — invokes `generateAdapters()` as part of `taproot init`

## Commits
- (run `taproot link-commits` to populate)
- `6ee6130ded4bde9ed1bea02302da5d6bc9763495` — (auto-linked by taproot link-commits)
- `c40231322206822ccdbe991515eb8289dca90da3` — (auto-linked by taproot link-commits)
- `26f79b76e3116d1ada05fcc52db1e0376a7a43ba` — (auto-linked by taproot link-commits)
- `902bce3d71d4fe3ed87fb1c638934ed42cc4367b` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/adapters.test.ts` — covers adapter generation for all five agent types, idempotency, and marker-based injection
- `test/integration/init.test.ts` — covers adapter generation as part of full init flow

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-03-21

## DoD Resolutions
- condition: no-git-abort | note: test/integration/adapters.test.ts beforeEach updated to create .git — required by AC-13 (runInit throws without git). Not applicable to adapter generation logic. | resolved: 2026-03-21
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: NO skill files modified. | resolved: 2026-03-27T17:08:19.818Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: NO — variant of existing invocation-block pattern. | resolved: 2026-03-27T17:08:19.559Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: NO — migration concern only. | resolved: 2026-03-27T17:08:19.296Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — follows pure-function adapter pattern. | resolved: 2026-03-27T17:08:19.037Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable. | resolved: 2026-03-27T17:08:18.781Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable. | resolved: 2026-03-27T17:08:18.525Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — no skill files. | resolved: 2026-03-27T17:08:18.266Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable. | resolved: 2026-03-27T17:08:18.004Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — source code. | resolved: 2026-03-27T17:08:17.741Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: COMPLIANT — invocation note uses neutral phrasing. | resolved: 2026-03-27T17:08:17.461Z

- condition: check-if-affected: skills/guide.md | note: not affected — guide.md not modified. | resolved: 2026-03-27T17:08:17.201Z

- condition: check-if-affected: src/commands/update.ts | note: REWORK: update.ts gains setCliWrapper() — adds cli: ./taproot/agent/bin/taproot when absent. | resolved: 2026-03-27T17:08:16.942Z

- condition: document-current | note: REWORK: buildClaudeSkillFile and buildGeminiSkillFile now accept cli? param and embed invocation note in each skill launcher. Callers pass cli from config. | resolved: 2026-03-27T17:08:16.681Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: NO skill files modified. | resolved: 2026-03-27T16:58:32.113Z

- condition: check-if-affected: examples/ | note: not affected — examples pick up cli: on next init. | resolved: 2026-03-27T16:58:31.857Z

- condition: check-if-affected: docs/ | note: not affected — docs already document cli:. | resolved: 2026-03-27T16:58:31.596Z

- condition: check | note:  if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md:NO skill files modified. | resolved: 2026-03-27T16:52:23.221Z

- condition: check | note:  does this story reveal a reusable pattern worth documenting in docs/patterns.md?:NO — variant of existing invocation-block pattern. | resolved: 2026-03-27T16:52:22.967Z

- condition: check | note:  does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml?:NO — migration concern, not ongoing. | resolved: 2026-03-27T16:52:22.712Z

- condition: check-if-affected-by | note:  quality-gates/architecture-compliance:COMPLIANT — follows pure-function adapter pattern; cli param flows from config. | resolved: 2026-03-27T16:52:22.456Z

- condition: check-if-affected-by | note:  human-integration/pattern-hints:not applicable — source code. | resolved: 2026-03-27T16:52:22.196Z

- condition: check-if-affected-by | note:  skill-architecture/commit-awareness:not applicable — no skill files modified. | resolved: 2026-03-27T16:52:21.941Z

- condition: check-if-affected-by | note:  skill-architecture/context-engineering:not applicable — no skill files modified. | resolved: 2026-03-27T16:52:21.684Z

- condition: check-if-affected-by | note:  human-integration/pause-and-confirm:not applicable — source code. | resolved: 2026-03-27T16:52:21.426Z

- condition: check-if-affected-by | note:  human-integration/contextual-next-steps:not applicable — source code, not a skill. | resolved: 2026-03-27T16:52:21.165Z

- condition: check-if-affected-by | note:  agent-integration/agent-agnostic-language:COMPLIANT — invocation note text uses neutral phrasing. | resolved: 2026-03-27T16:52:20.910Z

- condition: check-if-affected | note:  examples/:not affected — examples will pick up cli: on next init. | resolved: 2026-03-27T16:52:20.634Z

- condition: check-if-affected | note:  docs/:not affected — docs already document cli:. | resolved: 2026-03-27T16:52:20.378Z

- condition: check-if-affected | note:  skills/guide.md:not affected — guide.md not modified. | resolved: 2026-03-27T16:52:20.119Z

- condition: check-if-affected | note:  src/commands/update.ts:REWORK: update.ts gains setCliWrapper() — adds cli: ./taproot/agent/bin/taproot when absent. Adapters regenerated on taproot update will now carry the invocation note. | resolved: 2026-03-27T16:52:19.861Z

- condition: document-current | note: REWORK: buildClaudeSkillFile and buildGeminiSkillFile now accept cli? param and embed invocation note; overview step uses taprootBin. Callers in generateClaudeAdapter and generateGeminiAdapter pass cli. | resolved: 2026-03-27T16:52:19.591Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: COMPLIANT — buildConfigQuickRef() uses fully generic language (language, vocabulary, definitionOfDone options). Agent-specific reference files (buildClaudeConfigRefFile, buildGeminiConfigRefFile) generate content for adapter files (.claude/commands/, .gemini/commands/) which are explicitly excluded from the agent-agnostic-language standard per its Scope section. | resolved: 2026-03-24T14:49:06.224Z

- condition: gemini-toml-format-fix | note: Gemini CLI command TOML schema uses top-level `prompt` and `description` fields only — no `[command]` section, no `name` field (name derived from filename). Fixed buildGeminiSkillFile to match the actual schema. | resolved: 2026-03-21
- condition: document-current | note: init.test.ts updated to add AC-9–12 tests for interactive init prompts. agent-adapter impl not affected — adapter generation logic and init.ts adapter path unchanged. | resolved: 2026-03-21T07:50:39.999Z
- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: init.test.ts updated to add AC-9–12 tests for interactive init prompts. agent-adapter impl not affected — adapter generation logic and init.ts adapter path unchanged. | resolved: 2026-03-21T07:50:42.365Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: init.test.ts updated to add AC-9–12 tests for interactive init prompts. agent-adapter impl not affected — adapter generation logic and init.ts adapter path unchanged. | resolved: 2026-03-21T07:50:42.132Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: init.test.ts updated to add AC-9–12 tests for interactive init prompts. agent-adapter impl not affected — adapter generation logic and init.ts adapter path unchanged. | resolved: 2026-03-21T07:50:41.901Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: init.test.ts updated to add AC-9–12 tests for interactive init prompts. agent-adapter impl not affected — adapter generation logic and init.ts adapter path unchanged. | resolved: 2026-03-21T07:50:41.664Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: init.test.ts updated to add AC-9–12 tests for interactive init prompts. agent-adapter impl not affected — adapter generation logic and init.ts adapter path unchanged. | resolved: 2026-03-21T07:50:41.423Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: init.test.ts updated to add AC-9–12 tests for interactive init prompts. agent-adapter impl not affected — adapter generation logic and init.ts adapter path unchanged. | resolved: 2026-03-21T07:50:41.187Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: init.test.ts updated to add AC-9–12 tests for interactive init prompts. agent-adapter impl not affected — adapter generation logic and init.ts adapter path unchanged. | resolved: 2026-03-21T07:50:40.944Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: init.test.ts updated to add AC-9–12 tests for interactive init prompts. agent-adapter impl not affected — adapter generation logic and init.ts adapter path unchanged. | resolved: 2026-03-21T07:50:40.707Z

- condition: check-if-affected: skills/guide.md | note: init.test.ts updated to add AC-9–12 tests for interactive init prompts. agent-adapter impl not affected — adapter generation logic and init.ts adapter path unchanged. | resolved: 2026-03-21T07:50:40.468Z

- condition: check-if-affected: src/commands/update.ts | note: init.test.ts updated to add AC-9–12 tests for interactive init prompts. agent-adapter impl not affected — adapter generation logic and init.ts adapter path unchanged. | resolved: 2026-03-21T07:50:40.231Z

