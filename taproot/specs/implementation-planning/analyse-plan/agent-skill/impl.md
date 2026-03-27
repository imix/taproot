# Implementation: Agent Skill — plan-analyse

## Behaviour
../usecase.md

## Design Decisions
- **Agent skill, not CLI command**: analyse-plan must interpret spec content for vagueness and open questions — not just check file existence and state. This requires agent reasoning. The implementation is a skill file.
- **Read-only**: the skill never modifies `taproot/plan.md` or any hierarchy document. All output is a conversation report.
- **Positional dependency inference**: dependencies are inferred by plan position — a `[spec]` or `[refine]` item for the same path earlier in the list that is still `pending` blocks the downstream `[implement]` item. No formal dependency declarations needed.
- **Open question heuristics**: `?` markers, `TBD` entries, and `proposed` sub-behaviours in a spec are treated as signals of open questions.
- **Skill slug `plan-analyse`**: groups build/execute/analyse under the `plan-` namespace. Adapter: `/tr-plan-analyse`.

## Source Files
- `skills/plan-analyse.md` — skill instructions (package source; synced to `taproot/agent/skills/plan-analyse.md` by `taproot update`)
- `.claude/commands/tr-plan-analyse.md` — Claude Code adapter

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/plan-analyse.test.ts` — structural tests: required sections, no-plan guard, readiness checks (spec/implement/refine/dependency), report format (ready/attention/blocked), all-ready execute shortcut, read-only guarantee

## Status
- **State:** complete
- **Created:** 2026-03-27
- **Last verified:** 2026-03-27

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — pure agent skill (markdown instruction file); no TypeScript source, no external I/O at unexpected boundaries, no global state; follows existing skill architecture pattern | resolved: 2026-03-27
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: not applicable — analyse-plan usecase.md contains only AC-N entries, no NFR-N performance criteria | resolved: 2026-03-27

## DoD Resolutions
- condition: check-if-affected: src/commands/update.ts | note: affected — added 'plan-analyse.md' to SKILL_FILES array in src/commands/init.ts; consumed by update.ts via installSkills() so the new skill is picked up on taproot update | resolved: 2026-03-27
- condition: document-current | note: docs/agents.md updated with /tr-plan-analyse row. skills/guide.md updated with /tr-plan-analyse row. taproot/agent/docs/workflows.md already references /tr-plan-analyse via the planning section (it lists /tr-plan-analyse as the first What's next option in plan-build). No additional documentation needed. | resolved: 2026-03-27
- condition: check-if-affected: skills/guide.md | note: affected — added /tr-plan-analyse row to the slash commands table in skills/guide.md (and synced to taproot/agent/skills/guide.md) | resolved: 2026-03-27
- condition: check-if-affected: docs/ | note: affected — docs/agents.md updated with /tr-plan-analyse in the slash commands table | resolved: 2026-03-27
- condition: check-if-affected: examples/ | note: not affected — examples demonstrate taproot hierarchy structure; plan analysis is a runtime concern not a hierarchy convention that examples should scaffold | resolved: 2026-03-27
- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: compliant — skills/plan-analyse.md uses generic language throughout: 'the agent'; no Claude-specific names, no @{project-root} syntax (that belongs in .claude/commands/tr-plan-analyse.md adapter) | resolved: 2026-03-27
- condition: check-if-affected-by: human-integration/contextual-next-steps | note: compliant — skill ends with a What's next? block offering /tr-plan-execute (natural next step after analysis) and /tr-plan-build (to add more items) | resolved: 2026-03-27
- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — plan-analyse is read-only; it produces a report but does not modify anything and does not invoke skills; no confirmation gates needed | resolved: 2026-03-27
- condition: check-if-affected-by: skill-architecture/context-engineering | note: compliant — C-1: description is ~30 words ✓; C-2: no embedded reference docs ✓; C-3: no cross-skill repetition ✓; C-4: plan.md and usecase.md files read on demand in step 2-3 ✓; C-5: /compact signal present before What's next block ✓; C-6: What's next block present ✓; C-7: no always-loaded file additions ✓ | resolved: 2026-03-27
- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — plan-analyse is read-only and contains no git commit step | resolved: 2026-03-27
- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — plan-analyse does not process user-expressed requirements; it reads existing specs and classifies their readiness | resolved: 2026-03-27
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — pure agent skill file; no TypeScript source, no global state, no unexpected I/O; follows existing skill architecture pattern | resolved: 2026-03-27
- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: no — plan-analyse follows the agent-skill pattern and introduces no new architectural constraint | resolved: 2026-03-27
- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — the readiness analysis pattern is specific to plan-execution workflows; it does not generalise to other skills | resolved: 2026-03-27
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: compliant — plan-analyse.md instructs the agent to read taproot/plan.md and referenced usecase.md files; no shell execution, no credentials or tokens, read-only filesystem access | resolved: 2026-03-27
