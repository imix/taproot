# Global Truths

> **Taproot-managed directory.** Do not add `intent.md`, `usecase.md`, or `impl.md` files here.
> This directory is provided by taproot as a truth store — it is not a hierarchy node.
> Truths are automatically checked at commit time for every commit level — no configuration needed.

Shared facts that apply across the `taproot/` hierarchy — domain concepts, business rules,
entity definitions, and project conventions. Add truth files here directly; no intent or behaviour
spec is needed.

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
- `ux-principles_intent.md` — design principles that every feature must respect
- `business-rules_behaviour.md` — rules that acceptance criteria must respect
- `architecture_impl.md` — conventions that apply only to implementation code

Truth content is free-form markdown — prose, tables, bullet lists, and headings are all valid.

Run `/tr-define-truth` to capture a new truth interactively.
