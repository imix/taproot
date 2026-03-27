# taproot/agent/

Agent skills, docs, and the taproot binary wrapper live here after `taproot init`.

- `skills/` — canonical skill definitions (installed by `taproot init` / `taproot update`)
- `docs/` — reference docs loaded by agent skills
- `bin/taproot` — local binary wrapper (prefers global install, falls back to npx)

Run `taproot init` (or `taproot update`) to populate this directory.
