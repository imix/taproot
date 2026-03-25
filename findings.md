* extended BDD format? 
* research is not triggered efficiently
* add a backlog function to replace these findings (or just use github issues?)
* we need to ensure, that agents can run autonomously without user interaction
* taproot should work for all kind of projects, not only development. e.g. book authoring, financial reporting

* mass edits cause many DoD triggers on impl.md -> more elaborate rules? not sure if still a problem with tr-ineed

* remove bmad from examples (is it directly referenced somewhere)
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
