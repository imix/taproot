## Skill step emphasis

**Correct:**
```
**Mandatory commit gate**: immediately after skill completion, invoke `/tr-commit`. This step is **not optional** — do not mark the item `done` until the commit succeeds.
```

**Incorrect:**
```
On skill completion: invoke `/tr-commit` to commit the output.
```

**Rationale:** The second form was the source of agents skipping the commit step and marking items `done` without committing.

## Channel folders

**Correct:** `channels/vscode/` for VS Code extension artifacts.
**Incorrect:** VS Code `package.json` at project root.

## SKILL_FILES — user-facing only

**Correct:** `/tr-implement` (developer calls it directly) is in SKILL_FILES.
**Incorrect:** An internal routing sub-skill that only `/tr-ineed` calls is added to SKILL_FILES.

**Rationale:** Every SKILL_FILES entry generates a `/tr-` command and appears in `taproot update` output.

## Agent integration files — reference, don't define

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

**Rationale:** The second form duplicates commithook logic into a single-agent file. When the rule changes, it changes in one place but not the other.
