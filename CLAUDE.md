 * never add node_modules to git
 * build after each implementation
 * use short one line commit messages
 * when editing skills in `taproot/skills/`, always copy the file back to `skills/` (package source) before running `taproot update` — otherwise update overwrites your changes
 * when editing `README.md`, always run `bash scripts/sync-channel-readmes.sh` immediately after — the channel README (channels/vscode/README.md) embeds a SHA of root README.md, and the `sync-channel-readmes` test will fail if they drift

## Natural language triggers

When you are about to commit, or when the user says "commit", "let's commit", or similar — invoke `/tr-commit` instead of running git commands directly. See `## Natural Language Triggers` in `skills/guide.md` for the full list of phrases and skills.

## Writing intent.md and usecase.md

See the **Why / What / How rule** in `docs/concepts.md` — each layer must stay in its lane (intent = why, usecase = what, impl = how). The pre-commit hook enforces this; if it rejects a spec, the error message includes a correction hint.

**Before saving a `usecase.md`**, read the parent `intent.md` (`## Goal`, `## Stakeholders`, `## Success Criteria`) and verify four things: (a) **Actor–Stakeholder alignment** — Actor is named in Stakeholders or serves one directly; (b) **AC coverage** — at least one AC advances a Success Criterion; (c) **Scope boundary** — no AC describes behaviour outside the intent Goal; (d) **No contradiction** — no AC conflicts with a Success Criterion. Raise any misalignment before saving — do not wait for the commit gate.
