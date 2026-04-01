# Skill Step Emphasis Convention

When a skill step describes an action agents tend to skip, rush, or treat as optional — use strong, unambiguous language:

- **Mandatory:** / **not optional** / "do not proceed until..." / "this step is required before..."
- Applies to: commit gates, DoD resolution, truth-sign, confirmation prompts, any step where skipping breaks traceability or triggers a hook failure
- Soft language ("consider invoking", "you may", "invoke X to...") is reserved for advisory steps only — it signals to the agent that the step is optional

**Correct:**
```
**Mandatory commit gate**: immediately after skill completion, invoke `/tr-commit`. This step is **not optional** — do not mark the item `done` until the commit succeeds.
```

**Incorrect:**
```
On skill completion: invoke `/tr-commit` to commit the output.
```

The second form was the source of agents skipping the commit step and marking items `done` without committing.

---

# Channel Folder Convention

All distribution channel artifacts live under `channels/<channel-name>/` at project root.

- **VS Code extension:** `channels/vscode/`
- Do not place channel-specific source files, manifests (`package.json`), or READMEs at project root
- When adding a new distribution channel, create `channels/<channel-name>/` and place all channel-specific files there

---

# SKILL_FILES — user-facing skills only

Only add a skill to `SKILL_FILES` if a developer would call it directly. Internal sub-skills
routed to from other skills must be omitted — every entry generates a `/tr-` command and
appears in `taproot update` output, so internal-only skills add noise.

---

# Agent Integration Files — Reference, Don't Define

`CLAUDE.md`, `.aider.conf.yml`, `.cursorrules`, and equivalent agent integration files must **reference** quality rules — they must not **define** them.

- Quality rules (DoD/DoR conditions, commithook checks, enforcement logic) belong in `taproot/settings.yaml`, `src/commands/commithook.ts`, or `taproot/global-truths/`
- Agent files contain only: pointers to skills/docs, natural language triggers, and project-specific invocation hints (e.g. CLI prefix)
- A rule defined in an agent file is invisible to other agents and cannot be enforced at commit time — it will drift

**Correct:**
```
See the **Why / What / How rule** in `docs/concepts.md` — each layer must stay in its lane.
The pre-commit hook enforces this; if it rejects a spec, the error message includes a correction hint.
```

**Incorrect:**
```
When writing usecase.md: never mention SQL, REST, or HTTP verbs in the Main Flow.
Actor must be a human or external system. Postconditions must be present.
```

The second form duplicates commithook logic into a single-agent file. When the rule changes, it changes in one place but not the other.
