# Implementation: All Skills — Next-Step Guidance

## Behaviour
../usecase.md

## Design Decisions
- **Router vs leaf classification:** `ineed` and `plan` are routers for their main paths (delegate to another skill); terminal paths within those skills (near-duplicate stop, no-candidates, HITL) are treated as leaf terminations and receive inline guidance at those specific steps
- **Deterministic format:** Single `**Next:** <command>` line for skills with exactly one continuation (`implement → plan/status`, `plan HITL → refine`)
- **Open-ended format:** Lettered `**What's next?** [A]/[B]/[C]` menu for skills where multiple options are valid; capped at 3 options to avoid overwhelming choice
- **`grill-me` output:** The "Recommended next action" block from the synthesis was removed in favour of the standard lettered menu — keeps format consistent across all skills
- **`discover` step 14:** Existing "Suggested next steps" block replaced with standard `**What's next?**` format
- **`trace` bottom-up:** Guidance split — "not found" path shows `--unlinked` and `/tr-implement`; "found" path shows `/tr-refine` and `/tr-implement`
- **`analyse-change` gate:** Guidance appears after `[A] Proceed` only — not after `[N]` (returns to loop) or `[C]` (stops)
- **No new TypeScript:** Pure skill-file authoring; no CLI changes required
- **`status` findings-informed guidance (AC-7):** `skills/status.md` step 7 updated to surface top 1–2 specific priority items as direct lettered options when findings exist; generic fallback menu shown only when project is healthy

## Source Files
- `skills/intent.md` — creating path step 8, refining path step 6
- `skills/behaviour.md` — step 13
- `skills/implement.md` — step 13 (new)
- `skills/refine.md` — step 9 (new)
- `skills/audit.md` — step 6
- `skills/audit-all.md` — step 8 (new)
- `skills/status.md` — step 7
- `skills/discover.md` — step 14
- `skills/analyse-change.md` — step 9 (after [A])
- `skills/promote.md` — step 11
- `skills/grill-me.md` — step 6
- `skills/decompose.md` — step 12 (new)
- `skills/trace.md` — bottom-up step 6, top-down step 4
- `skills/guide.md` — step 4
- `skills/ineed.md` — step 5 near-duplicate path
- `skills/plan.md` — step 3 (no-candidates), step 5 (HITL)

## Commits
<!-- taproot-managed -->
- `f3a0669546cdcffbbc1589ab3de4fd9757c4400f` — (auto-linked by taproot link-commits)
- `9d31355b7c347db8b94d506a10fbc50477f36f59` — (auto-linked by taproot link-commits)
- `fe208c0cf8be1dacaa6eb11150ee8af5bb3774d8` — (auto-linked by taproot link-commits)
- `b2a271e011f217b13817671ac87d4cb8bd83888a` — (auto-linked by taproot link-commits)
- `faf7624472cfef86e57c46ddb5642eb26724ee65` — (auto-linked by taproot link-commits)
- `baf32e1909d2778ab7131523f664e3b7430aba4d` — (auto-linked by taproot link-commits)
- `a4fa534e3c960e982c1df42cad62e0586c3645cd` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/contextual-next-steps.test.ts` — verifies each skill file contains `**Next:**` or `**What's next?**` in its steps section

## Status
- **State:** complete
- **Created:** 2026-03-20
- **Last verified:** 2026-03-20

## DoD Resolutions
- condition: document-current | note: docs/ describes skill capabilities but not skill-internal patterns like next-step guidance — no doc update needed; the guide.md skill itself was updated as part of this implementation | resolved: 2026-03-20T06:11:51.654Z
- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: NO — adding /tr-browse as a next-step option is a UX addition to existing menus, not a cross-cutting concern requiring a new check entry. | resolved: 2026-03-30T06:05:57.046Z

- condition: check-if-affected: package.json | note: No new npm dependencies. Added /tr-browse option to What's next? menus in 3 skill files only. package.json unchanged. | resolved: 2026-03-30T06:05:57.036Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: VERIFIED — changes are limited to adding /tr-backlog as a lettered menu option in What's next? blocks. No shell commands, no credentials, no executable instructions beyond presenting a slash command suggestion. Least-privilege maintained. | resolved: 2026-03-25T15:38:21.496Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: COMPLIANT — all five updated skill files (audit.md, audit-all.md, grill-me.md, status.md, guide.md) use agent-agnostic language: 'the developer', 'the skill'. No Claude-specific syntax introduced. | resolved: 2026-03-25T15:38:13.494Z

- condition: check-if-affected: examples/ | note: NOT APPLICABLE — starter examples demonstrate hierarchy structure; they do not illustrate skill-internal What's next? guidance patterns. | resolved: 2026-03-25T15:38:03.507Z

- condition: check-if-affected: docs/ | note: NOT APPLICABLE — docs/ covers CLI commands and configuration; What's next? guidance changes are skill-internal patterns documented in the skills themselves, not in docs/. No docs/ changes required. | resolved: 2026-03-25T15:38:01.032Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: No. Adding /tr-commit to the guide table is a routine maintenance update, not a new reusable pattern. | resolved: 2026-03-21T07:27:10.912Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: No. Adding a row to guide.md's slash commands table does not introduce a new cross-cutting concern. | resolved: 2026-03-21T07:27:10.684Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: Not applicable — skills/guide.md is a markdown documentation file; no CLI source code modified. No architectural constraints apply. | resolved: 2026-03-21T07:27:10.454Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: Not applicable. guide.md does not receive natural language requirement descriptions and does not route to docs/patterns.md. | resolved: 2026-03-21T07:26:31.431Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: guide.md is a read-only skill with no git commit step. Not applicable. | resolved: 2026-03-21T07:26:31.204Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: Compliant. guide.md description unchanged. Added one table row — no new sections embedded. Skill remains within context budget. | resolved: 2026-03-21T07:26:26.443Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: Not applicable — guide.md is a read-only reference skill that presents documentation. No document authoring or destructive actions occur. | resolved: 2026-03-21T07:26:26.208Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: Compliant. guide.md updated to list /tr-commit in the slash commands table. The skill is a procedural execution skill with no primary output, so no What's next? block is required. The update to guide.md ensures the new skill is discoverable. | resolved: 2026-03-21T07:26:25.967Z

- condition: check-if-affected: skills/guide.md | note: guide.md was updated as part of this implementation (step 4 now shows next-step guidance) | resolved: 2026-03-20T06:11:52.117Z

- condition: check-if-affected: src/commands/update.ts | note: update.ts regenerates agent adapters and skill files; skill content changes (not structure) do not affect update.ts logic — no changes needed | resolved: 2026-03-20T06:11:51.890Z

- condition: sweep-taproot-yaml-rename | note: .taproot.yaml references updated to taproot/settings.yaml across the project; this impl.md contains no such references — no content changes required | resolved: 2026-03-20
