* extended BDD format? 
* research is not triggered efficiently
* add a backlog function to replace these findings (or just use github issues?)
* we need to ensure, that agents can run autonomously without user interaction
* taproot should work for all kind of projects, not only development. e.g. book authoring, financial reporting

* mass edits cause many DoD triggers on impl.md -> more elaborate rules? not sure if still a problem with tr-ineed

* we need an impact analysis skill
* add writing styles, clear concise, short sentences for BA. friendly but not too long for doc
* add shell script option to DoD and DoR
* make taproot robust, so that multiple agents can work in parallel
* multi agents with defined roles?

* in gates like DoD, DoR we want to check if other uncommitted stuff is there -> how to force commit?

* partial usecase implementations?
* find a better solution than the claude.md for commit hook

* `/tr-release` skill for releasing user projects built with taproot — separate concern from `taproot-distribution/cut-release` (which is the taproot maintainer's own release procedure); needs its own intent + behaviour
* CI template: `buildGithubWorkflow()` should add `npm audit --audit-level=high` as a CI step — needs its own behaviour spec, defer
* taproot's own CI: no `.github/workflows/` exists — create `taproot.yml` with validate + audit + test steps (separate concern, not part of the security intent)

---

## Developer Review: Product Roadmap

### 1. Developer Experience (DX) & IDE Integration
* **VS Code / JetBrains Extension:** Single biggest missing piece. Needs in-editor linting, spec navigation ("Go to Specification" for source files), status indicators (visual cues for stale specs), and integrated slash commands in the AI side-panel.
* **Boilerplate Scaffolding:** A "Scaffold implementation" command to create `impl.md` and stub source/test files based on a `usecase.md`.

### 2. Team Collaboration & Visibility
* **GitHub Action / PR Bot:** Impact reports on PRs ("This PR modifies files linked to 'X' behaviour. Spec is stale since Feb 2024").
* **Static Site Generation:** Built-in command (`taproot docs --serve`) to convert the hierarchy into a searchable documentation portal for stakeholders.
* **Conflict Resolution for AI:** Specialized tooling or documentation for merging requirement conflicts during parallel agent execution.

### 3. Advanced Intelligence & Automation
* **Automated Traceability Mapping:** Use LLMs to suggest which implementation record a code change belongs to (or suggest creating a new one).
* **Test-to-Requirement Mapping:** Automatically verify that tests in `impl.md` cover the ACs in `usecase.md` via LLM verification.
* **Cross-Repo Traceability:** Support for linking intents/behaviours across microservice repo boundaries.

### 4. Robustness & Safety
* **Commit Message Auto-tagging:** Helper to suggest `taproot(intent/behaviour/impl):` tags based on staged files.
* **State Transition Guardrails:** Stronger enforcement (e.g., cannot move to `complete` if `npm test` hasn't run in the last X minutes).

### 5. Onboarding & "The Empty Room" Problem
* **Reference Architectures:** "Standard Packs" for common domains (e.g., Authentication Intent Pack) with pre-loaded intents and behaviours.
* **Interactive Onboarding:** A `/tr-tour` command to walk developers through a live example requirement loop.
