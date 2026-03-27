# Taproot Book Authoring Starter

A ready-to-use taproot hierarchy for book and content projects. Designed for authors, researchers, and anyone managing structured long-form writing.

## What's included

| Intent | Behaviours |
|--------|-----------|
| `manuscript` — produce a complete, reviewed manuscript | write-chapter, editorial-review |
| `publishing` — submit or distribute the finished work | prepare-submission |

All specs are in `specified` state. The vocabulary is pre-configured to replace dev-specific terms with writing-appropriate ones.

## How to use

1. **Run** `npx @imix-js/taproot init --template book-authoring`
2. **Run** `npx @imix-js/taproot update` to apply vocabulary overrides to skill files
3. **Adapt** the intents and behaviours to your project — rename `write-chapter` to match your unit of work (article, scene, section)
4. **Start writing** with `/tr-implement taproot/manuscript/write-chapter/`

## Vocabulary overrides

The included `taproot/settings.yaml` replaces dev-specific terms in skill files:

| Default | Replaced with |
|---------|--------------|
| `tests` | `manuscript reviews` |
| `source files` | `chapters` |
| `implementation` | `writing` |
| `build` | `compile draft` |

## Adding more intents

Common additions for a book project:

```
taproot/
  research/       — source gathering, citation management
  structure/      — outline, chapter order, arc planning
  marketing/      — blurb, author bio, pitch materials
```
