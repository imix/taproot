# Discussion: Plugin Source

## Session
- **Date:** 2026-04-09
- **Skill:** tr-implement

## Pivotal Questions

1. **File-based vs compiled extension?** Cursor supports VS Code extensions (compiled TypeScript) but the spec describes convention-based discovery via `skills/*/SKILL.md, rules/*.mdc, commands/*.md`. A file-based approach avoids a TypeScript compilation step and lets the plugin distribute as plain markdown files — matching the spec's intent and keeping the plugin format readable and auditable.

2. **How do thin launchers handle the CLI prefix?** The `<!-- taproot:cli-invocation -->` prefix is project-specific (some projects use `node dist/cli.js`, others use `taproot`). SKILL.md launchers defer to the project's `taproot/settings.yaml` `cli:` field rather than hardcoding a prefix — this makes the plugin portable across projects.

3. **Pre-generated vs generated at install time?** Pre-generating and checking in all plugin files means users download a ready-to-use plugin without needing Node.js to build it. The trade-off is that `scripts/build-cursor-plugin.ts` must be re-run whenever SKILL_FILES changes, otherwise the plugin drifts from the canonical skills list.

## Alternatives Considered

- **VS Code extension (compiled TypeScript):** More powerful (can register VS Code commands, use Language Model API) but heavier — requires compilation, has a node_modules footprint, and the Cursor Marketplace may handle non-compiled extensions differently. Deferred pending cursor-marketplace behaviour being specced.
- **Inline skill content (copy full skill into SKILL.md):** Avoids the thin-launcher indirection but duplicates all skill content, creating drift risk whenever a skill is updated. Rejected — thin launchers are the explicit spec requirement (AC-3).

## Decision

File-based plugin in `channels/cursor/` built from `SKILL_FILES` via `scripts/build-cursor-plugin.ts`. All files are pre-generated and checked in. Thin launchers reference canonical skills at `taproot/agent/skills/<name>.md`. CLI prefix is deferred to the project's configuration. This satisfies all ACs except the marketplace publication (AC-1, AC-2) which depends on the unspecced `taproot-distribution/cursor-marketplace` prerequisite.

## Open Questions

- How does the Cursor Marketplace actually distribute file-based plugins? The `taproot-distribution/cursor-marketplace/` behaviour is unspecced — publication mechanism TBD.
- Should `npm run build` or `taproot update` automatically re-run the cursor plugin build script? Currently manual.
