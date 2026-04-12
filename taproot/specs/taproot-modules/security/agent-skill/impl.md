# Implementation: Agent Skill — Security Module

## Behaviour
../usecase.md

## Design Decisions
- All 6 skills (orchestrator + 5 layer sub-skills) are implemented in a single impl record. Sub-skills are co-required by the orchestrator and have no independent value before it exists; keeping them together avoids orphaned skill files with no coverage.
- Skills are distributed via `MODULE_SKILL_FILES` in `src/commands/init.ts` — consistent with the UX module. Projects that don't use security features are not burdened: no DoD conditions run unless the project explicitly wires `check-if-affected-by: taproot-modules/security` in their settings.yaml.
- Skill naming: `security-define` (orchestrator) + `security-<layer>` (sub-skills). Module-prefix `security-` is unambiguous and doesn't collide with any existing skill names.
- No new CLI TypeScript commands added — the module is pure agent skill markdown files. This satisfies the intent constraint "module conventions must be expressible without modifying core taproot source".
- Sub-skills write global truth files using free-form markdown. They do not call `/tr-define-truth` — they write directly to avoid a double-prompt loop when invoked from the orchestrator.
- DoD wiring is written to the project's `taproot/settings.yaml` under `definitionOfDone`, not to taproot's own settings — the condition only runs in projects that activate the module.
- `security-periodic-review.md` is dual-mode: setup (invoked from orchestrator, writes truth file) and run (invoked standalone, executes the review checklist). Mode is determined by whether a truth file exists and whether `--run` is passed or the developer selects the run option.
- Modules are organised by enforcement mechanism (rules / local-tooling / ci-cd / hardening / periodic-review) rather than OWASP subject. This keeps the module structurally stable as new tech surfaces add new vulnerability categories.

## Source Files
- `skills/security-define.md` — orchestrator skill (`/tr-security-define`): establishes project context, scans coverage across 5 layers, routes to sub-skills in sequence, offers DoD wiring at the end
- `skills/security-rules.md` — rules sub-skill: elicits secure coding conventions across 9 categories; writes `security-rules_behaviour.md`
- `skills/security-local-tooling.md` — local-tooling sub-skill: elicits SAST / secrets scanning / dep audit tool setup; writes `security-local-tooling_behaviour.md`
- `skills/security-ci-cd.md` — ci-cd sub-skill: elicits pipeline security gates, triggers, and fail conditions; writes `security-ci-cd_behaviour.md`
- `skills/security-hardening.md` — hardening sub-skill: elicits deploy-time baseline (headers, TLS, least-privilege, secrets management); writes `security-hardening_behaviour.md`
- `skills/security-periodic-review.md` — periodic-review sub-skill: setup mode elicits audit checklist + cadence; run mode executes the review and surfaces findings; writes/updates `security-periodic-review_behaviour.md`
- `src/commands/init.ts` — adds `security` entry to `MODULE_SKILL_FILES` with 6 filenames
- `skills/guide.md` — adds security module section to the slash commands table
- `taproot/agent/skills/guide.md` — synced to match skills/guide.md

## Commits
- (run `taproot link-commits` to populate)
- `e76f7d39ddb35f9b539fb5050afaac9e125d9c03` — (auto-linked by taproot link-commits)
- `4ecf1aff5463851b7b2bf2e02cb0b22fd038e114` — (auto-linked by taproot link-commits)
- `d27788bcbb6a2b6d8b2d0224c63c176b713e84a4` — (auto-linked by taproot link-commits)
- `3e0c80b8c36f59359455c15fcefc04295588c623` — (auto-linked by taproot link-commits)

## Tests
- No new TypeScript unit tests. Skill files are agent-executed markdown; correctness is verified through DoD conditions (`skill-architecture/context-engineering`, `agent-agnostic-language`, `portable-output-patterns`) that run at commit time.

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: NOT APPLICABLE — the parent usecase.md contains no NFR-N entries. No performance, security, or reliability thresholds defined. | resolved: 2026-04-12
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — adds 6 skill markdown files to skills/ and one 'security' key to MODULE_SKILL_FILES in src/commands/init.ts. This is exactly the established pattern used by the UX module. No new TypeScript commands, no new modules, no new architectural abstractions introduced. architecture.md constraints respected. | resolved: 2026-04-12T12:34:48.840Z

## Status
- **State:** complete
- **Created:** 2026-04-12
- **Last verified:** 2026-04-12

## DoD Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — adds 6 skill markdown files to skills/ and one 'security' key to MODULE_SKILL_FILES in src/commands/init.ts. This is exactly the established pattern used by the UX module. No new TypeScript commands, no new modules, no new architectural abstractions introduced. architecture.md constraints respected. | resolved: 2026-04-12T12:35:00.000Z
- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: COMPLIANT — all 6 skill files reviewed. Use generic language throughout: 'the agent' not 'Claude', no @{project-root} syntax, no CLAUDE.md references. The /tr-security-* command prefix is the standard taproot skill invocation convention, not a Claude-specific mechanism. No agent-specific assumptions found. | resolved: 2026-04-12T12:27:50.218Z
- condition: check-if-affected: examples/ | note: NOT AFFECTED — no existing examples exercise security module skills, and no new examples are required for this change. Module activation is covered by docs/modules.md. | resolved: 2026-04-12T12:31:46.214Z

- condition: check-if-affected: docs/ | note: AFFECTED AND UPDATED — docs/modules.md updated with complete security module documentation: activation command, layers/sub-skills table, periodic-review dual-mode description, what-gets-written file listing, and DoD wiring snippet. Security entry removed from the Planned modules table. | resolved: 2026-04-12T12:31:45.937Z

- condition: check-if-affected: skills/guide.md | note: AFFECTED AND UPDATED — added 6 new security module skill entries to the slash commands table in skills/guide.md (and synced to taproot/agent/skills/guide.md): /tr-security-define, /tr-security-rules, /tr-security-local-tooling, /tr-security-ci-cd, /tr-security-hardening, /tr-security-periodic-review. | resolved: 2026-04-12T12:31:45.626Z

- condition: check-if-affected: src/commands/update.ts | note: NOT AFFECTED — update.ts imports SKILL_FILES from init.ts and iterates MODULE_SKILL_FILES automatically. Adding a new 'security' key to MODULE_SKILL_FILES in init.ts is sufficient; update.ts requires no changes to handle the new module. | resolved: 2026-04-12T12:31:38.759Z

- condition: check-if-affected: package.json | note: NOT AFFECTED — no new npm dependencies added. The security module consists entirely of agent skill markdown files and a Record entry in init.ts. No new packages required. | resolved: 2026-04-12T12:31:38.467Z

- condition: document-current | note: COMPLIANT — docs/modules.md updated with full security module section (activation, layers table, periodic-review dual-mode, what-gets-written listing, DoD wiring). README.md does not enumerate individual skills (UX module is also not listed there); docs/modules.md is the canonical location for module documentation, consistent with the UX module pattern. | resolved: 2026-04-12T12:31:33.929Z

- condition: check-if-affected-by: agent-integration/portable-output-patterns | note: COMPLIANT — all 6 skill files use the [artifact-review] pattern for presenting draft truth files before writing. The orchestrator uses a coverage table for the scan output. No raw rendering instructions. Action prompts use canonical option-letter conventions ([A] = Accept/proceed, [B] = Replace/alternative, [C] = Cancel, [K] = Keep, [U] = Update, [R] = Reset, [?] = Get help). | resolved: 2026-04-12T12:28:56.168Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: COMPLIANT — all 6 new skill files reviewed against docs/security.md. No shell command execution in any skill file. No hardcoded credentials or tokens. Least-privilege: skills only read codebase files and global-truths/, write scoped truth files to taproot/global-truths/, and write one DoD condition to taproot/settings.yaml (with explicit developer confirmation [A]/[B]). All writes are within project scope and confirmed by developer before execution. | resolved: 2026-04-12T12:28:48.594Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: NO — the security module follows the existing Quality module pattern already documented in docs/patterns.md. No new reusable pattern is introduced; this is a second instance of the established pattern. | resolved: 2026-04-12T12:28:40.957Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: NO for taproot's own settings.yaml. The security module's DoD condition (check-if-affected-by: taproot-modules/security) is something USER PROJECTS optionally add to their own settings.yaml. Taproot itself is a developer tooling product — the condition does not apply to taproot's own implementations. | resolved: 2026-04-12T12:28:36.107Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: NOT APPLICABLE — pattern-hints applies to skills that receive natural language requirement descriptions and route them to matching patterns (tr-ineed, tr-behaviour, tr-implement, etc.). Security module activation skills receive structured domain questions about stack, tooling, and deployment configuration — not requirement descriptions. Outside the scope of this spec. | resolved: 2026-04-12T12:28:20.401Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: NOT APPLICABLE — none of the 6 security module skills instruct the agent to run git commit. They reference /tr-commit in What's next blocks as a suggested next step only, which is the correct pattern. The commit-awareness spec applies to skills that directly orchestrate git commits. | resolved: 2026-04-12T12:28:14.917Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: COMPLIANT — C-1: all 6 descriptions are concise (1-2 sentences, under 50 tokens). C-2: No embedded reference docs. C-3: No cross-skill repetition. C-4: File reads are on-demand per step (step 1 of each sub-skill reads only the specific truth file and context file). C-5: Session hygiene signal present before What's next in all 6 skills. C-6: What's next blocks present in all skills. C-7: No changes to always-loaded files. | resolved: 2026-04-12T12:28:10.123Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: COMPLIANT — security-define pauses between layers ('Continue to next?') and before DoD wiring. Each sub-skill uses the [artifact-review] pattern before writing truth files, offering [A] Write / [B] Replace / [C] Cancel. No multi-document write happens without explicit confirmation. | resolved: 2026-04-12T12:28:03.631Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: COMPLIANT — all 6 skills include a What's next? block. The orchestrator (security-define) presents a 3-option block after completion. Each sub-skill presents 3 options. The periodic-review skill presents context-appropriate blocks for both setup and run modes. All blocks appear after primary output delivery. | resolved: 2026-04-12T12:27:56.999Z

