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

## Tests
- No new TypeScript unit tests. Skill files are agent-executed markdown; correctness is verified through DoD conditions (`skill-architecture/context-engineering`, `agent-agnostic-language`, `portable-output-patterns`) that run at commit time.

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: NOT APPLICABLE — the parent usecase.md contains no NFR-N entries. No performance, security, or reliability thresholds defined. | resolved: 2026-04-12
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — this implementation adds skill markdown files to skills/ and appends filenames to MODULE_SKILL_FILES in init.ts. This is the established pattern used by the UX module. No new TypeScript commands, no new architectural modules. | resolved: 2026-04-12

## Status
- **State:** in-progress
- **Created:** 2026-04-12
- **Last verified:** 2026-04-12
