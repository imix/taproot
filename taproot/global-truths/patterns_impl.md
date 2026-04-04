## Batch skill progress persistence

Skills that process items in batches must write progress to `.taproot/sessions/<skill-slug>-status.md` after each confirmed item. On startup, check for an existing status file and offer to resume. On clean completion, delete the status file.

No shared pointer file — the status file name is self-documenting. An agent resuming after compression scans `.taproot/sessions/` to find where it was.

## Build-time vs runtime config split

Config that affects taproot's behaviour has two application points — build-time (`taproot update`) and runtime (each CLI invocation). If a config value affects both, the two must stay in sync.

Build-time transforms installed artefacts (skill files, adapter files). Runtime influences tool behaviour directly (validators, hooks). Language pack config is the canonical example: `taproot update` rewrites skill files with translated headers; `taproot validate-format` reads the same pack at runtime to accept them.

Runtime config loading must happen at command boundaries, not inside core modules.
