# Discussion: Skill Files + Config Support

## Session
- **Date:** 2026-03-26
- **Skill:** tr-implement

## Pivotal Questions

**Where does autonomous mode awareness live — CLI or skills?**
The skills are markdown files read and executed by the agent, not by the taproot CLI. Confirmation prompts like "Present the plan. Do not proceed until the user approves." are instructions to the agent, not CLI gates. Adding a `--autonomous` CLI flag would have no effect on those prompts — the agent would still pause unless the skill text told it not to. Therefore, the behavior change belongs in the skill markdown files, with the CLI's role limited to exposing the `autonomous` config setting.

**Which skills need updating?**
Only skills with explicit blocking confirmation prompts:
- `skills/implement.md` step 4: "Do not proceed to writing code until the user approves."
- `skills/commit.md` step 3: "Wait for confirmation before proceeding." (when nothing is staged)
Other skills present structured choices but take no blocking action before acting. The `pause-and-confirm` skill family is a separate concern already governed by `check-if-affected-by`.

## Alternatives Considered
- **CLI flag `taproot dod --autonomous`** — rejected because `taproot dod` runs after implementation, not before. The confirmation prompts that autonomous mode bypasses are in skills, not in the CLI.
- **New `taproot autonomous` command** — rejected as unnecessary. The three activation mechanisms (env var, flag, settings) are checked by the agent at skill-load time, not by a CLI command.
- **Update all skills with confirmation prompts** — narrowed to `implement.md` and `commit.md` only. The others either present choices without blocking, or block only on genuine errors (not approval requests).

## Decision
Autonomous mode is implemented as a skill-text convention: a preamble added to `skills/implement.md` and `skills/commit.md` instructs the agent to check for autonomous mode (env var, flag, or settings) before reaching a confirmation step. When active, the agent proceeds without pausing. The `TaprootConfig` type gains `autonomous?: boolean` so `settings.yaml` can carry the setting, and CONFIGURATION.md is updated for discoverability. No new CLI commands or runtime enforcement paths are needed.

## Open Questions
- None.
