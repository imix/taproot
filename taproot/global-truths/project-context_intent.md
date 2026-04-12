## Project context

- **Product type:** CLI developer tool (npm package) using agent skills — a specification management CLI (`taproot`) distributed via npm, providing terminal commands and agent skill files consumed by AI coding assistants
- **Stack:** TypeScript / Node.js (Commander.js for CLI parsing, js-yaml for config, Vitest for testing, compiled to `dist/` via `tsc`)
- **Structural goals:** clear layering (commands/ vs core/ vs validators/), minimal dependencies, testability (core logic exportable without subprocess spawning)
