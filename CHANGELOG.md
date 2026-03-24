# Changelog

All notable changes to taproot are documented here.

<!-- entries below -->

## [0.2.0] - 2026-03-24

### Highlights

First public release of taproot — a folder-based requirement hierarchy for AI-assisted development.

### Core capabilities

- **Requirement hierarchy** — `intent.md` / `usecase.md` / `impl.md` structure; plain Markdown, git-versioned alongside code
- **Quality gates** — Definition of Done (DoD) and Definition of Ready (DoR) enforced via pre-commit hook; configurable conditions in `.taproot/settings.yaml`
- **Agent skills** — 18 slash commands (`/tr-ineed`, `/tr-implement`, `/tr-commit`, `/tr-status`, `/tr-discover`, and more) for Claude Code (Tier 1), Gemini CLI (Tier 2), and community adapters
- **CLI validation** — `taproot validate-format`, `validate-structure`, `sync-check`, `coverage`, `check-orphans`, `acceptance-check`
- **Traceability** — `taproot link-commits` maps git history to impl.md; `taproot overview` generates a live hierarchy map for AI agents
- **Adaptability** — language pack support (non-English section headers), domain vocabulary overrides, agent-agnostic output
- **CI workflow** — provenance-attested npm publish via GitHub Actions with approval gate
