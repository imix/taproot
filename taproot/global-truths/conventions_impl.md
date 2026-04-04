## Skill step emphasis

When a skill step describes an action agents tend to skip — use mandatory language ("**not optional**", "do not proceed until"). Soft language ("consider", "you may") signals the step is optional.

## Channel folders

All distribution channel artifacts live under `channels/<channel-name>/` at project root. Do not place channel-specific files at project root.

## SKILL_FILES — user-facing only

Only add a skill to `SKILL_FILES` if a developer would call it directly. Internal sub-skills add noise to `/tr-` commands and `taproot update` output.

## Agent integration files — reference, don't define

`CLAUDE.md`, `.aider.conf.yml`, `.cursorrules` and equivalent agent files must reference quality rules — not define them. Rules defined in agent files are invisible to other agents and cannot be enforced at commit time.
