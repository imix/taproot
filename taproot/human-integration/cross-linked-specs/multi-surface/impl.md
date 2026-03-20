# Implementation: Multi-Surface — validate-format + update backfill + skill steps

## Behaviour
../usecase.md

## Design Decisions
- `validateFormat()` gains an optional `node?: FolderNode` fourth parameter; when provided, `checkLinkSection()` runs to verify `## Behaviours` / `## Implementations` presence and validity — backward-compatible since callers that do not pass `node` skip the check
- Link section name is derived from `node.marker`: `intent` → `## Behaviours`, `behaviour` → `## Implementations`; `taproot-managed` marker comment is written on the heading line
- `refreshLinks()` is added to `src/commands/update.ts` and called before OVERVIEW regen — it walks intent.md and usecase.md files, injects missing sections, appends missing child links, prunes stale links, and reports each modified file with `updated  <path>`
- Relative link paths are computed using `path.relative(dirname(parentPath), childDocPath)`, which produces `./<slug>/usecase.md` or `./<slug>/impl.md` — correct for GitHub rendering
- Title extraction scans the child document for the first `# Heading` line; falls back to folder slug on parse failure or missing heading
- Skills (`behaviour.md`, `implement.md`, `refine.md`, `intent.md`) receive inline steps/notes to maintain parent link sections on creation and to preserve them during rewrites
- `<!-- taproot-managed -->` is appended after the heading text (e.g. `## Behaviours <!-- taproot-managed -->`) so humans can see the section is tool-maintained without breaking markdown rendering

## Source Files
- `src/validators/format-rules.ts` — `checkLinkSection()` helper + optional `node` param on `validateFormat()`
- `src/commands/validate-format.ts` — passes `node` to `validateFormat()` in the tree-walk loop
- `src/commands/update.ts` — `refreshLinks()` function called from `runUpdate()`
- `skills/behaviour.md` — step to update parent `## Behaviours` section after writing usecase.md
- `skills/implement.md` — step to update parent `## Implementations` section before declaration commit
- `skills/refine.md` — note to preserve link sections before rewriting
- `skills/intent.md` — note to preserve link sections before rewriting
- `.taproot/skills/behaviour.md` — mirror of skills/behaviour.md
- `.taproot/skills/implement.md` — mirror of skills/implement.md
- `.taproot/skills/refine.md` — mirror of skills/refine.md
- `.taproot/skills/intent.md` — mirror of skills/intent.md

## Commits
- (run `taproot link-commits` to populate)
- `36fcc327a0333c36e8e88a4ecdea0f1b303c9737` — (auto-linked by taproot link-commits)
- `3d6a59df62329ebdf978509f830ded97865fce7c` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/cross-links.test.ts` — covers: validate-format detects missing ## Behaviours on intent.md with child behaviours; validate-format detects missing ## Implementations on usecase.md with child impls; validate-format passes when sections present; stale link detection (linked file missing); refreshLinks adds missing sections; refreshLinks appends missing child links; refreshLinks is idempotent; refreshLinks prunes stale links; title extracted from first # Heading; fallback to folder slug when no heading

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-03-19

## DoD Resolutions
- condition: document-current | note: docs/cli.md documents taproot update cross-link refresh and validate-format link section checks; skills/guide.md lists taproot update and updated validate-format description | resolved: 2026-03-19T19:56:18.230Z
- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — cross-linked-specs link management is already described in the usecase.md itself. Not a reusable pattern for docs/patterns.md. | resolved: 2026-03-20T20:03:55.977Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: no — cross-linked-specs is already the mechanism enforced by taproot update and tr-implement/tr-behaviour as side-effects. No new .taproot/settings.yaml entry needed. | resolved: 2026-03-20T20:03:55.740Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: not applicable — this implementation modifies taproot hierarchy markdown files (usecase.md and impl.md link sections). No CLI source code, no architectural decisions involved. docs/architecture.md constraints do not apply to hierarchy document link management. | resolved: 2026-03-20T20:03:55.500Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: cross-linked-specs writes usecase.md and impl.md link sections as side-effects of document creation — it is a multi-surface impl (usecase.md updates + impl.md updates), not a skill file with git commit steps. commit-awareness constraints apply to skills/*.md files with explicit git commit instructions. Not applicable. | resolved: 2026-03-20T20:03:55.258Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: Updated in pattern-hints implementation pass. behaviour.md received pattern check step 1a; implement.md received pattern check in step 4. Both comply with the spec: pattern check fires before the skill's main work, [A]/[B] choice offered, docs/patterns.md read on demand. | resolved: 2026-03-20T10:31:23.550Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: C-5 /compact signal added to guide.md in the context-engineering compliance pass. C-1: guide.md description is within 50 tokens. C-2/C-3: no embedded docs or cross-skill repetition. C-4: no bulk pre-load. All constraints compliant. | resolved: 2026-03-20T09:56:14.063Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: Not applicable. This impl covers guide.md and docs updates — no multi-document sequential writing in a user-facing skill session. | resolved: 2026-03-20T09:56:12.387Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: Compliant. This skill (guide.md description update) does not produce primary output — it is a reference skill. What's next? not applicable. | resolved: 2026-03-20T09:56:11.132Z

- condition: check-if-affected: skills/guide.md | note: guide.md updated to include taproot update and updated validate-format description | resolved: 2026-03-19T19:56:18.721Z

- condition: check-if-affected: src/commands/update.ts | note: update.ts was modified — refreshLinks() added and called from runUpdate() | resolved: 2026-03-19T19:56:18.475Z

- condition: sweep-taproot-yaml-rename | note: .taproot.yaml references updated to .taproot/settings.yaml across the project; this impl.md contains no such references — no content changes required | resolved: 2026-03-20
