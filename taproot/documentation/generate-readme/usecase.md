# Behaviour: Maintain README Currency

## Actor
Taproot maintainer / contributor — a developer who has made changes that affect the user-facing surface (CLI commands, skills, configuration options).

## Preconditions
- A user-facing change has been made (new command, skill, config option, or structural documentation change)
- `README.md` and `docs/` exist in the project root

## Main Flow
1. Maintainer identifies what user-facing change was made (new command, skill, config option, or structural change)
2. Maintainer updates the relevant section(s) in `README.md` or the appropriate file under `docs/`
3. Maintainer commits the documentation change alongside the code change that prompted it

## Alternate Flows
### DoD gate triggers a review
- **Trigger:** `/tr-implement` runs the DoD check and the `document-current` condition fires
- **Steps:**
  1. Agent surfaces the condition description: "ensure all sections in readme.md are up to date"
  2. Maintainer reviews `README.md` and `docs/` against recent changes
  3. If current: maintainer confirms; DoD gate passes and the impl is marked complete
  4. If stale: maintainer updates the relevant sections, then confirms

### No user-facing changes
- **Trigger:** Code change does not affect CLI commands, skills, or configuration options
- **Steps:**
  1. Maintainer skips documentation update
  2. When the `document-current` DoD gate fires, maintainer confirms "no documentation changes needed"
  3. DoD gate passes

## Postconditions
- `README.md` accurately reflects all currently implemented CLI commands, skills, and configuration options
- `docs/` contains detailed reference material: concepts, CLI reference, agent setup, workflows, and configuration

## Error Conditions
- **README drift discovered by a user**: maintainer identifies the stale section, updates it, and commits

## Status
- **State:** implemented
- **Created:** 2026-03-19
- **Last reviewed:** 2026-03-19

## Notes
- Documentation currency is enforced through a `document-current` DoD gate rather than automated generation — the gate requires human/agent verification before any impl is marked complete
- `README.md` is a fast intro (tagline, folder diagram, quick start, why, links); detailed reference lives in `docs/` (concepts, CLI, agents, workflows, configuration)
- No code generation pipeline exists; manual editing is the maintenance mechanism, DoD is the enforcement mechanism
