# Implementation: Skill

## Behaviour
../usecase.md

## Design Decisions
- **Skill-only implementation**: no new CLI command or TypeScript code is required; the entire behaviour is agent-driven and implemented as a skill prose file. All scanning, filtering, and candidate presentation steps are agent-executed at invocation time.
- **Dismissed suppression via backlog.md**: candidates dismissed by the developer are appended as "reviewed — not a truth: `<term>`" entries to `.taproot/backlog.md`. On the next discovery run the skill reads this file and excludes those entries — reusing the existing backlog format rather than introducing a separate suppression list.
- **review-all integration is additive**: the truth discovery pass is added as a new final step in `review-all.md`. It reuses the same scan and candidate logic, but outputs into a `## Truth Candidates` section in the review report and defers unprocessed candidates to backlog automatically.
- **Batch limit of 5**: matches the usecase spec (batches of 5 when >10 candidates). Avoids overwhelming the developer and keeps context manageable.
- **`/tr-ineed` routing with pre-populated context**: promoted candidates are passed to `/tr-ineed` with the candidate term, proposed scope, and evidence pre-populated. If `/tr-ineed` routes to a location other than `define-truth`, the skill surfaces the routing decision and offers to redirect.

## Source Files
- `skills/discover-truths.md` — standalone skill implementing the full discover-truths usecase (Main Flow, all Alternate Flows, Error Conditions)
- `skills/review-all.md` — extended with step 7: truth discovery pass appended to the review report
- `.taproot/skills/discover-truths.md` — synced copy for agent use
- `.taproot/skills/review-all.md` — synced copy for agent use

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/discover-truths.test.ts` — covers AC-1 (candidates surfaced from recurring terms), AC-2 (filtering of already-defined truths), AC-4 (backlogged candidate recorded in backlog.md), AC-5 (skipped candidate leaves no record), AC-6 (too-small hierarchy exits cleanly), AC-8 (dismissed candidate suppressed from future runs)

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: reviewed architecture-compliance spec; this implementation adds two skill files (discover-truths.md, review-all.md update) and one test file. No TypeScript source changes. No architectural deviations — follows the established skill + test pattern. | resolved: 2026-03-26
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: no new NFRs introduced; the skill is interactive and latency is not a measurable concern. No performance constraints in the usecase. | resolved: 2026-03-26

## Status
- **State:** complete
- **Created:** 2026-03-26
- **Last verified:** 2026-03-26

## DoD Resolutions
- condition: document-current | note: skills/guide.md updated: /tr-discover-truths added to slash commands table. docs/workflows.md updated: new 'Surfacing implicit project truths' section added with usage example and description of the candidate workflow. | resolved: 2026-03-26T13:58:03.668Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: Skills modified: discover-truths.md (new), review-all.md (extended). Security review: (1) No shell command execution in either skill — both are pure agent prose instructions with no Bash/shell steps. (2) No credentials or tokens hardcoded. (3) Least-privilege: skills read taproot/ hierarchy files and .taproot/backlog.md (read-only on hierarchy docs), write only to .taproot/backlog.md (append-only). All writes are via agent actions, not shell commands. Compliant. | resolved: 2026-03-26T13:59:27.287Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: No new reusable pattern introduced. The candidate suppression mechanism reuses the existing backlog.md convention. The interactive P/S/B/D per-candidate menu is specific to this skill. No docs/patterns.md update needed. | resolved: 2026-03-26T13:59:19.239Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: No. discover-truths is a standalone skill for periodic use — not an architectural rule that applies to every implementation. No settings.yaml entry needed. | resolved: 2026-03-26T13:59:14.619Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: Applies: implementation adds discover-truths.md (new skill file), review-all.md (extension), test/integration/discover-truths.test.ts, and src/commands/init.ts (SKILL_FILES update). Architecture review: (1) Filesystem as data model — skill reads/writes .taproot/backlog.md as specified. (2) Stateless CLI commands — not a CLI command; skill is stateless (no session state). (3) Agent-agnostic output — no agent-specific syntax. (4) Module boundary: SKILL_FILES update is in commands/init.ts at command boundary — compliant. No deviations from architectural constraints. | resolved: 2026-03-26T13:59:09.391Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: Not applicable: discover-truths.md does not add any new patterns to .taproot/docs/patterns.md. The suppression-via-backlog mechanism reuses an existing convention already documented in skills/backlog.md. No new pattern entry needed. | resolved: 2026-03-26T13:59:01.713Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: Not applicable: discover-truths.md contains no git commit step. It is a read-only scanning and routing skill — it invokes /tr-ineed for promoted candidates but does not commit directly. All three constraints (C-1, C-2, C-3) recorded as not applicable. | resolved: 2026-03-26T13:58:56.947Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: Applies: discover-truths.md is a new skill file. Evaluating all constraints: (C-1) Description is ~48 tokens — compliant. (C-2) No embedded reference docs; links to /tr-ineed and .taproot/backlog.md by reference only — compliant. (C-3) No content duplicated from AGENTS.md or other skills — compliant. (C-4) Files read on demand per phase: Phase 1 reads global-truths/ and backlog.md when needed for suppression list; Phase 3 reads hierarchy files for scanning — step-scoped — compliant. (C-5) Skill has 9 interactive steps across 5 phases — long workflow. Session hygiene signal present before What's next? block — compliant. (C-6) What's next? block present — compliant. (C-7) No changes to always-loaded files — not applicable. | resolved: 2026-03-26T13:58:52.124Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: Not applicable: discover-truths is not a bulk document-writing skill. It presents one candidate at a time with a P/S/B/D choice menu and does not write documents directly — it delegates to /tr-ineed for any promoted candidate. The pause-and-confirm spec applies to skills that 'write more than one document in sequence' (Alternate Flow: Single-document skills — not applicable). Compliant with the spirit: the skill never writes files without developer confirmation. | resolved: 2026-03-26T13:58:43.010Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: Applies: discover-truths.md produces primary output (discovery summary). The skill ends with a What's next? block offering [A] /tr-ineed, [B] /tr-status, [C] /tr-review-all. Compliant with open-ended context menu format. | resolved: 2026-03-26T13:58:33.246Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: Applies: discover-truths.md is a skills/*.md file. Reviewed for agent bias: (AC-1) no bare 'Claude' or 'Claude Code' references; (AC-4) no @{project-root} syntax. All language is generic ('the agent', 'the developer'). Compliant. | resolved: 2026-03-26T13:58:27.603Z

- condition: check-if-affected: examples/ | note: Starter examples (webapp, book-authoring, cli-tool) are scaffolding templates. They contain no truth files and do not reference /tr-discover-truths. Not affected. | resolved: 2026-03-26T13:58:21.458Z

- condition: check-if-affected: docs/ | note: docs/workflows.md: added 'Surfacing implicit project truths' section. docs/cli.md lists only CLI commands — /tr-discover-truths is an agent skill, not a CLI command, so no update needed there. Other docs/ files (concepts.md, architecture.md, configuration.md, patterns.md, security.md) do not reference individual skills. | resolved: 2026-03-26T13:58:16.540Z

- condition: check-if-affected: skills/guide.md | note: Added /tr-discover-truths to the slash commands table in skills/guide.md and synced to .taproot/skills/guide.md. | resolved: 2026-03-26T13:58:16.287Z

- condition: check-if-affected: src/commands/update.ts | note: update.ts calls installSkills(skillsDir, SKILL_FILES) from init.ts. Added 'discover-truths.md' to SKILL_FILES so the new skill is included in taproot update runs. update.ts itself does not need further changes. | resolved: 2026-03-26T13:58:08.807Z

