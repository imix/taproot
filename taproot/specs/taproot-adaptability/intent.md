# Intent: Taproot Adaptability

## Stakeholders
- **Non-English team lead**: configuring taproot for a team that works in German, French, Japanese, or another language — needs structural elements (section headers, Gherkin keywords, state values) to render in the team's language, not English
- **Non-dev project owner**: adopting taproot for book authoring, financial reporting, or legal review — hits dev-specific vocabulary ("tests", "source files", "build") that doesn't map to their domain and blocks adoption
- **Taproot maintainer**: shipping a tool that reaches beyond English-speaking software teams — needs a principled extensibility model that doesn't require forking or patching skills for each new language or domain
- **AI coding agent**: reads and follows installed skill files — if structural keywords are substituted into a non-English language pack (e.g. `## Akteur`), the agent must still be able to parse skill structure correctly; localised skill files must remain machine-navigable

## Goal
Enable taproot to adapt to any project context — language and domain — so that non-English teams and non-development projects can use taproot without hitting hardcoded assumptions.

## Success Criteria
- [ ] A team setting `language: de` in `settings.yaml` sees German section headers, Gherkin keywords, and state values throughout their hierarchy and CLI output — with no English leaking through validators or hooks
- [ ] A non-dev project setting domain vocabulary overrides in `settings.yaml` replaces dev-specific terms (tests, source files, build) with domain-appropriate equivalents across all installed skills
- [ ] Validators and the pre-commit hook accept documents whose section headers match the configured language pack — not just hardcoded English strings
- [ ] At least 5 language packs ship with taproot: de, fr, es, ja, pt

## Design Decisions
- **Structural keywords only, not prose** — taproot substitutes section headers, Gherkin keywords, and state values; prose within sections is not translated. This is a deliberate scope boundary, not a technical limitation — it keeps taproot's substitution surface small and agent-manageable.
- **Build-time substitution, not runtime expansion** — vocabulary and language pack substitutions are applied at `taproot update` / `taproot init` time and baked into skill files. Validators read the language pack setting from `settings.yaml` at invocation time. This is a design choice: it avoids per-invocation token parsing overhead and keeps skill files human-readable without placeholders.
- **One JSON file per language** — language pack format follows the `gherkin-languages.json` precedent: a single flat JSON file keyed by token name, shipped with taproot in `src/languages/`.

## Behaviours <!-- taproot-managed -->
- [Language Support](./language-support/usecase.md)
- [Domain Vocabulary](./domain-vocabulary/usecase.md)

## Status
- **State:** active
- **Created:** 2026-03-23
- **Last reviewed:** 2026-03-23
