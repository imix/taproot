# Global Truths

Shared facts that apply across the `taproot/` hierarchy — domain concepts, business rules,
entity definitions, and project conventions.

## How to add a truth

Create a `.md` file and name it to signal its scope:

| Scope | Applies to | Convention |
|-------|------------|------------|
| intent | All levels | `name_intent.md` or `intent/name.md` |
| behaviour | Behaviour + implementation | `name_behaviour.md` or `behaviour/name.md` |
| impl | Implementation only | `name_impl.md` or `impl/name.md` |

Files without a scope suffix default to intent scope (broadest).

## Examples

- `glossary_intent.md` — term definitions used across all specs
- `business-rules_behaviour.md` — rules that acceptance criteria must respect
- `tech-choices_impl.md` — conventions that apply only to implementation code

Truth content is free-form markdown — prose, tables, bullet lists, and headings are all valid.
