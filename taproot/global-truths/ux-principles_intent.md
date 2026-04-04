## Option labeling

Letters are semantic operations with fixed meaning across all skills. Numbers are positional selections with no fixed meaning (What's next menus, item pickers).

| Letter | Meaning | Where used |
|--------|---------|------------|
| `[A]` | Accept / Proceed | Mid-flow decision prompts |
| `[C]` | Cancel — abort, no changes made | Mid-flow decision prompts |
| `[R]` | Review | Mid-flow and post-execution prompts |
| `[L]` | Later (defer) | Mid-flow — item deferred, not abandoned |
| `[X]` | Drop (exclude) | Mid-flow — item intentionally excluded |
| `[D]` | Done / Stop for now | Continuation prompts only |
| `[P]` | Plan — invoke `/tr-plan` with findings | Multi-finding closing prompts |
| `[B]` | Browse | Mid-flow, when context navigation is offered |

Never repurpose a reserved letter. Max 4 options per prompt. `[S]` and `[Q]` are retired.

## Fail early

When something will fail, detect and surface it before starting long operations. Validate preconditions at the start of commands — not after the user has answered questions or waited for work to complete.

## Abbreviated hierarchy paths

Strip the hierarchy root prefix (`taproot/`, `taproot/specs/`) and `.md` extension from paths shown in prompts and output. Preserve trailing `/` for directory references. Expand to full path before passing to CLI commands.

## Review at every spec decision point

Any plan-execute prompt where a spec exists or was just written must include `[R] Review`. It invokes `/tr-browse`, runs to full completion, then re-presents the same prompt with all options.

## Plan offer after multi-finding skills

Skills that surface multiple findings must include `[P] Plan these — build a taproot/plan.md from these findings` in their What's next section.

## No surprises

Announce destructive or irreversible actions before taking them. Surface errors with enough context to understand what went wrong. Never silently skip a step or swallow an error.
