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
