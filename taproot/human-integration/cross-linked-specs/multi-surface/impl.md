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

## Tests
- `test/integration/cross-links.test.ts` — covers: validate-format detects missing ## Behaviours on intent.md with child behaviours; validate-format detects missing ## Implementations on usecase.md with child impls; validate-format passes when sections present; stale link detection (linked file missing); refreshLinks adds missing sections; refreshLinks appends missing child links; refreshLinks is idempotent; refreshLinks prunes stale links; title extracted from first # Heading; fallback to folder slug when no heading

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-03-19

## DoD Resolutions
- condition: document-current | note: docs/cli.md documents taproot update cross-link refresh and validate-format link section checks; skills/guide.md lists taproot update and updated validate-format description | resolved: 2026-03-19T19:56:18.230Z
- condition: check-if-affected: skills/guide.md | note: guide.md updated to include taproot update and updated validate-format description | resolved: 2026-03-19T19:56:18.721Z

- condition: check-if-affected: src/commands/update.ts | note: update.ts was modified — refreshLinks() added and called from runUpdate() | resolved: 2026-03-19T19:56:18.475Z

