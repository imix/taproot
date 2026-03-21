# Implementation: Agent Skill Pattern Check

## Behaviour
../usecase.md

## Design Decisions
- Pattern check is inserted as a new **step 0** in skills where the need is expressed at invocation (ineed, refine). In behaviour and implement it fires at the first step that receives the user's description.
- Signal phrases from the spec are embedded directly in the step text so the agent knows exactly what to match against — no ambiguity about what constitutes a "match".
- The interruption presents the pattern name, a one-line description, and [A]/[B] choice. It does not dump the full `docs/patterns.md` content into context — it names the pattern and the agent reads the relevant section on demand if the user chooses [A].
- All four skills (ineed, behaviour, implement, refine) updated. Other skills (tr-plan, tr-decompose, etc.) are less likely to receive raw requirement expressions and are left for future passes when their source implementations are touched.
- Both `skills/` (package source) and `.taproot/skills/` (installed copy) updated in sync per CLAUDE.md policy.

## Source Files
- `skills/ineed.md` — step 0 added: scan docs/patterns.md before classifying requirement
- `skills/behaviour.md` — step 1a added: scan for pattern match on the behaviour description
- `skills/implement.md` — step 4 updated: check for pattern match before presenting implementation plan
- `skills/refine.md` — step 0 added: scan for pattern match on the change being described

## Commits
- placeholder
- `66143dba2b4236b46dde2a3f1153f6f857c8e8fc` — (auto-linked by taproot link-commits)
- `4de58738cb4dd7b89eb15bf5b3469d00b6ce7921` — (auto-linked by taproot link-commits)

## Tests
- `test/unit/skills.test.ts` — AC-1: docs/patterns.md scan step present in all four skills; AC-2: [A]/[B] choice present; AC-6: skip silently when patterns.md absent (ineed.md); AC-7: [A] does not add hierarchy entry / write usecase.md / modify usecase.md

## Status
- **State:** complete
- **Created:** 2026-03-20
- **Last verified:** 2026-03-20

## DoD Resolutions
- condition: document-current | note: No new CLI commands or configuration options added. docs/patterns.md already exists and is accurate. No README changes needed. | resolved: 2026-03-20T10:28:17.724Z
- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — pattern-hints is a behaviour spec, not a reusable configuration pattern for docs/patterns.md. | resolved: 2026-03-20T20:04:08.203Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: no — pattern-hints is already enforced via check-if-affected-by: human-integration/pattern-hints in .taproot/settings.yaml. No new entry needed. | resolved: 2026-03-20T20:04:07.970Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: not applicable — pattern-hints implementation modifies skills/*.md (agent skill markdown). No CLI source code, no architectural decisions in docs/architecture.md apply. | resolved: 2026-03-20T20:04:07.737Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: this IS the pattern-hints implementation — it defines the behaviour. Self-referential check: the skill scans docs/patterns.md for matches and interrupts before proceeding, exactly as specified in the usecase. Compliant. | resolved: 2026-03-20T20:04:07.505Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — pattern-hints is a read-only agent skill that surfaces pattern matches before routing. It contains no git commit steps. | resolved: 2026-03-20T20:04:07.271Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: C-1: descriptions unchanged and within 50 tokens. C-2: no embedded docs — patterns are referenced by name, full content read on demand. C-3: pattern check block is consistent across skills but not duplicated in CLAUDE.md. C-4: docs/patterns.md is read on demand at step 0 only when a match is plausible. C-5: /compact signals already present in all four skills. C-6: What's next? blocks unchanged. All compliant. | resolved: 2026-03-20T10:28:24.000Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: Not applicable. Pattern check step does not write any documents — it either guides through pattern application (which involves writing specs, covered by pause-and-confirm in those skills) or passes through to the original flow. | resolved: 2026-03-20T10:28:22.726Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: Compliant. The new step 0/1a in each skill is an interruptive check before the skill's main flow — it does not produce primary output and thus does not require a What's next? block. Skills that do produce output already have What's next? blocks unchanged. | resolved: 2026-03-20T10:28:21.466Z

- condition: check-if-affected: skills/guide.md | note: Not affected. No new slash commands added. Pattern check is a new step within existing skills, not a new skill. | resolved: 2026-03-20T10:28:20.208Z

- condition: check-if-affected: src/commands/update.ts | note: Not affected. update.ts copies skill files by name; no change to names or copy logic. | resolved: 2026-03-20T10:28:18.973Z

- condition: sweep-taproot-yaml-rename | note: .taproot.yaml references updated to .taproot/settings.yaml across the project; this impl.md contains no such references — no content changes required | resolved: 2026-03-20
