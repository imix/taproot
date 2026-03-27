# Implementation: README Content

## Behaviour
../usecase.md

## Design Decisions
- Animation leads the README — placed above all prose to satisfy AC-6; visitor sees the workflow before reading a word
- Hand-crafted animated SVG (`docs/demo.svg`) chosen over VHS: zero external tooling dependency, GitHub-safe, no JS required — satisfies NFR-2
- Tagline "Your AI coding agent finally knows why." placed beneath the animation as the first text — conveys the emotional benefit (AC-7) before the technical explanation
- Pain point hook preserved as the opening paragraph below the tagline — names the specific problem (AI coding loses *why* context) before any code block or feature list, satisfying AC-1
- Marketing copy throughout uses first-person emotional framing ("finally knows why", "requirements that survive the conversation") rather than feature bullets alone — AC-7
- Animation script: `npx taproot init --agent claude` → `/tr-ineed "I need user auth"` → `usecase.md written` → `taproot dod` → `✓ All checks passed` — shows the end-to-end loop in under 12 seconds
- H1 kept as "Taproot" for search/SEO; tagline is separate paragraph — intent constraint requires plain Markdown, no build step
- "Taproot tracks itself" section updated with current counts — trust signal for evaluators (AC-4)
- No automated test — content artefact; ACs verified by human review and GitHub rendering

## Source Files
- `README.md` — project landing page satisfying AC-1 through AC-7 and NFR-1
- `docs/demo.svg` — animated SVG terminal demo embedded at top of README; satisfies AC-6 and NFR-2

## Commits
- (run `taproot link-commits` to populate)
- `6c80e89dd4807de7a211adc0386efbf3df4dc85c` — (auto-linked by taproot link-commits)
- `26ee968be01d21b49a6825dcc30a8cd614eb6efc` — (auto-linked by taproot link-commits)
- `8a5de155a441ac8d76ca4b2676a766e3c703b498` — (auto-linked by taproot link-commits)
- `fa57208f439f49117e3cfc07a7fbe7b10c807e85` — (auto-linked by taproot link-commits)

## Tests
- (no automated test — content artefact; ACs verified by human review; NFR-1/NFR-2 verified by GitHub rendering)

## Status
- **State:** complete
- **Created:** 2026-03-21
- **Last verified:** 2026-03-24

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: not applicable — implementation writes README.md and docs/demo.svg (documentation/asset files); no code design decisions; no architectural constraints apply | resolved: 2026-03-24
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: compliant — NFR-1 requires correct GitHub Markdown rendering (testable boolean); NFR-2 requires animation renders without JS (testable boolean) — both are specific and measurable | resolved: 2026-03-24

## DoD Resolutions
- condition: document-current | note: README.md rewritten with animation, new tagline, updated counts (18 intents/53 behaviours); all CLI commands, skills, and options accurately reflected; docs/ links unchanged and valid | resolved: 2026-03-24T20:30:06.954Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: not applicable — no skill files modified; this story writes README.md and docs/demo.svg only | resolved: 2026-03-24T20:30:06.961Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — README rewrite is a one-off presentation task; the animated SVG approach is too project-specific to be a reusable pattern | resolved: 2026-03-24T20:30:06.961Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: no — README rewrite and animation asset are project-specific presentation; no cross-cutting enforcement concern for other implementations | resolved: 2026-03-24T20:30:06.960Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: not applicable — implementation writes README.md and docs/demo.svg (documentation/asset); no code design decisions; no architectural constraints apply | resolved: 2026-03-24T20:30:06.960Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — no skill file modified; pattern-hints applies to skills that route user requests | resolved: 2026-03-24T20:30:06.960Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — README.md is a documentation file; no skill containing git commit steps was modified | resolved: 2026-03-24T20:30:06.959Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — no skill files modified; context-engineering constraints apply to skills/*.md only | resolved: 2026-03-24T20:30:06.959Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — writes a single README.md and one SVG file; not a multi-document bulk-authoring skill flow | resolved: 2026-03-24T20:30:06.958Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — README.md is a static document; no agent skill output or What's next? interaction surface | resolved: 2026-03-24T20:30:06.958Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: not applicable — this implementation writes README.md and an SVG asset; no agent skill files, adapter files, or agent-specific language added | resolved: 2026-03-24T20:30:06.957Z

- condition: check-if-affected: docs/ | note: docs/demo.svg added as new animation asset; no existing docs/ content modified; docs/ links in README point to unchanged files | resolved: 2026-03-24T20:30:06.957Z

- condition: check-if-affected: skills/guide.md | note: not affected — guide.md covers skill command reference; README presentation copy is a separate concern | resolved: 2026-03-24T20:30:06.957Z

- condition: check-if-affected: src/commands/update.ts | note: not affected — update.ts distributes skill and adapter files; README.md and docs/demo.svg are not managed by update.ts | resolved: 2026-03-24T20:30:06.956Z

