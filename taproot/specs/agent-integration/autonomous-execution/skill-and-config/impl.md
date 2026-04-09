# Implementation: Skill Files + Config Support

## Behaviour
../usecase.md

## Design Decisions
- Autonomous mode awareness lives in the skill markdown files — the agent reads and follows skill instructions, so behavior changes belong where instructions are defined, not in the CLI. Adding a runtime flag to the CLI would not help because skills are text executed by the agent, not by the taproot process.
- Three activation mechanisms (env var `TAPROOT_AUTONOMOUS=1`, `--autonomous` flag, `autonomous: true` in settings) are documented in skills as a "check autonomous mode" preamble that the agent reads at skill load time. No CLI orchestration is needed.
- `autonomous?: boolean` added to `TaprootConfig` so `autonomous: true` in `taproot/settings.yaml` is a first-class supported setting — parsed, typed, and discoverable via CONFIGURATION.md.
- Only `skills/implement.md` and `skills/commit.md` carry explicit confirmation prompts that autonomous mode should bypass. Other skills (tr-next, tr-status, etc.) present structured choices but do not block on user approval before acting — no changes needed there.
- `<!-- autonomous: pending-review -->` is a pure skill-text convention. No CLI parsing is needed because the marker is written into `impl.md` by the agent following skill instructions; `taproot dod` already reads `## DoD Resolutions` entries by convention.
- The CONFIGURATION.md generator is updated so `.taproot/CONFIGURATION.md` (the agent-facing config reference) documents `autonomous` alongside `cli` and `language` — the three runtime-behavior settings.

## Source Files
- `src/validators/types.ts` — adds `autonomous?: boolean` to `TaprootConfig`
- `src/core/configuration.ts` — adds `autonomous` section to generated `.taproot/CONFIGURATION.md`
- `skills/implement.md` — adds autonomous mode preamble and conditional at plan-approval step (step 4)
- `skills/commit.md` — adds autonomous mode conditional at staging confirmation step (step 3)
- `docs/configuration.md` — documents `autonomous` setting under a new section

## Commits
- (run `taproot link-commits` to populate)
- `926b0081587e68b801d22f96ac1d8b775c1ca9b4` — (auto-linked by taproot link-commits)
- `5f8ce144e19b605c1c1f9320f5a547ebf00ad5a7` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/autonomous-execution.test.ts` — AC-6: `autonomous: true` in settings.yaml parsed correctly; settings without `autonomous` leave it undefined (no implicit activation); CONFIGURATION.md generator includes `autonomous` entry

## Status
- **State:** complete
- **Created:** 2026-03-26
- **Last verified:** 2026-04-09

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — changes are confined to `src/validators/types.ts` (type definition), `src/core/configuration.ts` (CONFIGURATION.md generator), `src/adapters/` (adapter generation), and skill markdown files. No new commands, no global state, no cross-layer imports. Config field follows established `deepMerge` pattern. No architectural constraints violated. | resolved: 2026-03-26
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: not applicable — parent usecase.md has no `**NFR-N:**` entries. | resolved: 2026-03-26

## DoD Resolutions
- condition: document-current | note: docs/configuration.md updated: new 'Autonomous Execution' section documents autonomous: true setting, TAPROOT_AUTONOMOUS=1 env var, and --autonomous flag, plus all behavioral changes in each activation mode. README.md does not need updating — it covers getting-started content only; configuration details belong in docs/configuration.md. .taproot/CONFIGURATION.md regenerated via taproot update to include the autonomous setting. | resolved: 2026-03-26T05:33:14.750Z
- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: NO — the G1 and G3 fixes extend existing autonomous mode behavior already covered by this story's original implementation. No new cross-cutting concern introduced. The commit-awareness check-if-affected-by already covers skill/commit.md changes. | resolved: 2026-03-29T19:44:11.913Z

- condition: check-if-affected: package.json | note: Prose-only additions to skills/commit.md and skills/plan-execute.md — no new dependencies, no new CLI commands, no npm scripts. package.json unchanged. | resolved: 2026-03-29T19:44:08.456Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: compliant — skills/implement.md and skills/commit.md were modified. The ## Autonomous mode sections added are instruction text only. No shell command execution was introduced. No credentials or tokens. No privileged operations. The autonomous mode preamble tells the agent to check env vars and config — reading, not executing. Least-privilege: autonomous mode reduces agent confirmations but does not grant additional permissions or system access. | resolved: 2026-03-26T05:36:58.839Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: yes — the ## Autonomous mode preamble convention (check env var / flag / settings at skill load time) is a reusable pattern for any skill that has confirmation prompts. Adding to docs/patterns.md. | resolved: 2026-03-26T05:36:31.881Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: no — autonomous mode is an opt-in configuration feature. It does not introduce a cross-cutting architectural constraint that every future implementation must verify. No new settings.yaml entry warranted. | resolved: 2026-03-26T05:36:27.384Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — autonomous?: boolean added to TaprootConfig (validators layer); no new module boundaries crossed; configuration.ts (core layer) generates documentation, no I/O in non-command layers; skill markdown files are not TypeScript source. deepMerge handles the new optional field without changes. No global mutable state, no raw exceptions exposed. | resolved: 2026-03-26T05:36:22.836Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — pattern-hints applies to skills that receive natural language intent and should check docs/patterns.md for matches. implement.md and commit.md receive structured taproot task arguments (impl paths, commit types), not open-ended natural language intent. No pattern-hints check needed. | resolved: 2026-03-26T05:36:16.738Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — commit-awareness governs skills that include git commit steps (require loading the full commit skill). The changes here modify implement.md (which already uses /tr-commit in its commit steps) and commit.md itself. No new commit steps were added; the commit-awareness constraint is already satisfied by the existing skill structure. | resolved: 2026-03-26T05:36:11.873Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: applicable — two skill files modified. C-1: Description sections unchanged, still concise. C-2: No reference docs embedded inline; the ## Autonomous mode preamble is 6 lines of instruction text, not documentation. C-3: The preamble is duplicated across implement.md and commit.md; this is intentional — skills are loaded independently and each needs the check at load time before any steps. The repetition is 6 lines per skill, well within acceptable bounds. C-4 (on-demand loading, if applicable): autonomous mode preamble is structural, not reference content — it must appear at the top to be read before steps. | resolved: 2026-03-26T05:36:06.780Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: applicable and compliant — pause-and-confirm governs bulk-authoring skills (tr-discover, tr-decompose). The autonomous mode sections added here do not remove the [Y]/[E]/[S]/[Q] queue confirmation from those skills. implement.md and commit.md are not bulk-authoring skills; their confirmation points are plan-approval (implement) and staging-confirmation (commit). Autonomous mode bypasses these per the autonomous-execution spec, which is the intended behavior. | resolved: 2026-03-26T05:35:59.421Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — this implementation modifies existing skills (implement.md, commit.md) by adding autonomous mode sections to steps that already exist. No new skill with its own output and What's next? block was created. The existing What's next? blocks in implement.md (step 13) remain intact. | resolved: 2026-03-26T05:35:53.707Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: compliant — the ## Autonomous mode sections added to skills/implement.md and skills/commit.md use generic language throughout: 'the agent', 'any agent', no Claude-specific syntax, no @{project-root} references, no slash-command names. The three activation mechanisms (env var, flag, settings) are named as generic mechanisms, not agent-specific constructs. | resolved: 2026-03-26T05:35:48.571Z

- condition: check-if-affected: examples/ | note: not affected — examples/ contains starter hierarchy templates (webapp, book-authoring, cli-tool). None reference autonomous mode, skill activation, or configuration settings that this implementation changes. | resolved: 2026-03-26T05:34:26.486Z

- condition: check-if-affected: docs/ | note: affected and updated — docs/configuration.md: new 'Autonomous Execution' section added documenting the three activation mechanisms and behavioral changes. No other docs/ files required updates. | resolved: 2026-03-26T05:34:22.359Z

- condition: check-if-affected: skills/guide.md | note: not affected — guide.md covers onboarding essentials for new users. Autonomous mode is an advanced configuration feature; adding it to the onboarding guide would add noise for most users. The feature is discoverable via docs/configuration.md and .taproot/CONFIGURATION.md. | resolved: 2026-03-26T05:33:23.676Z

- condition: check-if-affected: src/commands/update.ts | note: not affected — update.ts regenerates adapters from skills/ and calls buildConfigurationMd(). The updated buildConfigurationMd() now includes the autonomous section. update.ts itself requires no code changes. | resolved: 2026-03-26T05:33:19.460Z

