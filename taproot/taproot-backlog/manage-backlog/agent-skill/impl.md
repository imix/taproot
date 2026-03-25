# Implementation: Agent Skill

## Behaviour
../usecase.md

## Design Decisions
- Pure skill-file implementation — no TypeScript/CLI changes beyond adding to `SKILL_FILES`. All logic (detect arg, read/write file, triage loop) is conversational.
- `backlog.md` added to `SKILL_FILES` in `src/commands/init.ts` so it installs via `taproot init` and refreshes via `taproot update`.
- `taproot update` used to sync both `.taproot/skills/backlog.md` and `.claude/commands/tr-backlog.md` — cleaner than manual copy.
- Non-standard lines in `.taproot/backlog.md` are preserved and skipped silently during triage, with a count reported after — avoids data loss for hand-edited content.
- Blank/whitespace argument detected early with a one-line warning — no silent no-ops.

## Source Files
- `skills/backlog.md` — new skill file implementing all 7 ACs; two modes: capture (arg present) and triage (no arg)
- `.taproot/skills/backlog.md` — synced via `taproot update`
- `src/commands/init.ts` — added `'backlog.md'` to `SKILL_FILES`
- `skills/guide.md` — added `/tr-backlog` to the slash commands reference table
- `.taproot/skills/guide.md` — synced via `taproot update`

## Commits
<!-- taproot-managed -->
- `6a124d4e7761ce770fa9ac4894d1c57e1fb86931` — (auto-linked by taproot link-commits)
- `4e2f603500b0d1297455361a1fcd6bb16c569a5e` — (auto-linked by taproot link-commits)
- `f767269414483e2b64207fd21f9617d4c8bfbe23` — (auto-linked by taproot link-commits)
- `28194c69ae273b9ac5948aae4dcff5f8e186249d` — (auto-linked by taproot link-commits)
- `51441bdc305596ffc6c51f8af43dccda33db643e` — (auto-linked by taproot link-commits)
- `43615125f80d29c7ee7f15e91bcba3909c54992f` — (auto-linked by taproot link-commits)
- `11de94ec68d0cd1e81dda5690fdef298e999e654` — (auto-linked by taproot link-commits)

## Tests
- `test/unit/skills.test.ts` — AC-1: capture confirms with no follow-up; AC-2: D/K/P options present; AC-5: promote delegates to /tr-ineed; AC-6: empty backlog message; AC-7: triage completion summary format

## Status
- **State:** complete
- **Created:** 2026-03-25

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: NOT APPLICABLE — architecture-compliance governs TypeScript CLI source code; this implementation modifies only skill files and the SKILL_FILES array constant | resolved: 2026-03-25T13:35:00.000Z
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: NOT APPLICABLE — no NFR entries in usecase.md; backlog capture has no performance targets | resolved: 2026-03-25T13:35:00.000Z

## DoD Resolutions
- condition: document-current | note: skills/guide.md updated with /tr-backlog entry. README.md and docs/ document CLI commands, not individual skill steps — no further changes required. | resolved: 2026-03-25T13:38:04.329Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: VERIFIED — skills/backlog.md and skills/guide.md additions contain only documentation text and interactive prompts; no shell commands, no credentials, no executable instructions beyond 'append to file and display'. | resolved: 2026-03-25T13:40:09.727Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: NO — the arg/no-arg mode split is specific to backlog; it is not a cross-cutting architectural pattern for other skills. | resolved: 2026-03-25T13:40:09.479Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: NO — backlog is a standalone capture/triage skill; it does not introduce a pattern that every implementation must satisfy. | resolved: 2026-03-25T13:40:09.216Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: NOT APPLICABLE — architecture-compliance governs TypeScript CLI source code; this implementation modifies only skill files and the SKILL_FILES array constant. | resolved: 2026-03-25T13:38:47.490Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: NOT APPLICABLE — pattern-hints governs skills that receive natural language need descriptions; backlog capture receives a one-liner memo, not a requirement to route. | resolved: 2026-03-25T13:38:47.227Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: NOT APPLICABLE — backlog.md does not include any git commit steps; file writes go to .taproot/backlog.md only, not staged or committed. | resolved: 2026-03-25T13:38:46.927Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: COMPLIANT — backlog.md reads only .taproot/backlog.md at most; no background docs loaded, no unnecessary context accumulation. Triage session hygiene note included. | resolved: 2026-03-25T13:38:46.648Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: NOT APPLICABLE — pause-and-confirm governs skills that write multiple documents in sequence; backlog writes only .taproot/backlog.md and does not bulk-author. | resolved: 2026-03-25T13:38:39.393Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: APPLIED — backlog.md step 6 added with What's next? block after triage completion offering [A] /tr-ineed and [B] /tr-status. Capture mode is exempt: its purpose is zero-friction one-line output with no follow-up. | resolved: 2026-03-25T13:38:39.142Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: COMPLIANT — backlog.md uses agent-agnostic language throughout: 'the developer', 'the skill'; no Claude-specific syntax or references. | resolved: 2026-03-25T13:38:38.888Z

- condition: check-if-affected: examples/ | note: NOT APPLICABLE — backlog is a capture/triage skill; starter examples demonstrate hierarchy structure, not skill usage patterns. | resolved: 2026-03-25T13:38:15.497Z

- condition: check-if-affected: docs/ | note: NOT APPLICABLE — docs/ covers CLI commands and configuration; /tr-backlog is a slash command documented in skills/guide.md, not a CLI binary command. No docs/ changes required. | resolved: 2026-03-25T13:38:15.263Z

- condition: check-if-affected: skills/guide.md | note: APPLIED — added /tr-backlog row to the slash commands table in skills/guide.md and synced to .taproot/skills/guide.md. | resolved: 2026-03-25T13:38:15.027Z

- condition: check-if-affected: src/commands/update.ts | note: NOT APPLICABLE — taproot update regenerates skills from SKILL_FILES; backlog.md is now in SKILL_FILES so it installs/refreshes automatically. No change to update.ts logic needed. | resolved: 2026-03-25T13:38:14.788Z

