# Intent: Taproot Adaptability

## Stakeholders
- **Non-English team lead**: configuring taproot for a team that works in German, French, Japanese, or another language — needs structural elements (section headers, Gherkin keywords, state values) to render in the team's language, not English
- **Non-dev project owner**: adopting taproot for book authoring, financial reporting, or legal review — hits dev-specific vocabulary ("tests", "source files", "build") that doesn't map to their domain and blocks adoption
- **Taproot maintainer**: shipping a tool that reaches beyond English-speaking software teams — needs a principled extensibility model that doesn't require forking or patching skills for each new language or domain

## Goal
Enable taproot to adapt to any project context — language, domain, or workflow — so that non-English teams and non-development projects can use taproot without hitting hardcoded assumptions.

## Success Criteria
- [ ] A team setting `language: de` in `settings.yaml` sees German section headers, Gherkin keywords, and state values throughout their hierarchy and CLI output — with no English leaking through validators or hooks
- [ ] A non-dev project setting domain vocabulary overrides in `settings.yaml` replaces dev-specific terms (tests, source files, build) with domain-appropriate equivalents across all installed skills
- [ ] Validators and the pre-commit hook accept documents whose section headers match the configured language pack — not just hardcoded English strings
- [ ] At least 5 language packs ship with taproot: de, fr, es, ja, pt

## Constraints
- Structural keyword substitution only — prose within sections is not translated by taproot; agents translate prose on their own
- Domain vocabulary applies at `taproot update` / `taproot init` time (build-time substitution), not at runtime token expansion
- Language pack format follows the `gherkin-languages.json` precedent — a single JSON file per language, keyed by section name

## Behaviours <!-- taproot-managed -->
- [Language Support](./language-support/usecase.md)
- [Domain Vocabulary](./domain-vocabulary/usecase.md)

## Status
- **State:** active
- **Created:** 2026-03-23
- **Last reviewed:** 2026-03-23
