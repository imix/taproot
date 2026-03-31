# Workflows

Six things you do day-to-day with taproot — and the single command that handles each.

---

## I have an idea or requirement

```
/tr-ineed "users need to export their data as CSV"
```

Tell the agent what you need in plain language. It figures out where in the hierarchy it belongs, checks for near-duplicates, and writes the spec. If your requirement is vague it asks a few questions first — problem, persona, success criteria, scope boundary — then writes it.

You never have to think about whether you need an intent or a behaviour. `/tr-ineed` routes it.

---

## I want to plan a batch of work

```
/tr-plan
/tr-plan-analyse
/tr-plan-execute
```

**A typical session looks like this:**

You have a list of things you want to build. You describe them — or point at unimplemented specs already in the hierarchy — and `/tr-plan` builds a prioritised list, classifying each item as `hitl` (needs your input) or `afk` (agent can run it autonomously). The plan is saved to `taproot/plan.md` and persists across sessions.

```
/tr-plan "add CSV export, add JSON export, add rate limiting, add audit log"
```

Before executing, run `/tr-plan-analyse` to catch anything that isn't ready — ambiguous specs, unresolved dependencies, missing prerequisites. It produces a per-item report so you can fix blockers before starting.

Then:

```
/tr-plan-execute
```

`afk` items run straight through without stopping — spec, implement, tests, commit, move on. `hitl` items pause and wait for your input before continuing. When you return, everything autonomous is done and the decisions are waiting exactly where you left off.

**Modes:**

```
/tr-plan-execute --mode specify      # only run spec + refine phases (stop before implementing)
/tr-plan-execute --mode implement    # only run implementation phases (skip spec work)
```

Use `specify` mode to work through all specs with the agent first, refine them together, then hand off the whole implementation phase as a single autonomous batch.

---

## I want to capture something without losing my flow

```
/tr-backlog "the export should also support JSON — low priority"
```

Drop an idea, finding, or deferred decision into `taproot/agent/backlog.md` mid-session. One command, no context switching. Items in the backlog feed into the next `/tr-plan` run.

---

## I want to analyse my specs

```
/tr-audit taproot/password-reset/request-reset/usecase.md
/tr-audit-all taproot/password-reset/
```

Use `/tr-audit` to stress-test a single spec before you implement it — the agent challenges assumptions, asks adversarial questions, and flags coverage gaps. Use `/tr-audit-all` on a subtree to catch contradictions between siblings and cross-check every intent criterion against the behaviours below it.

Run `/tr-audit` on a fresh spec before starting implementation. Run `/tr-audit-all` before a release or after significant scope changes.

---

## I want to check the health of my project

```
/tr-status
```

A health dashboard: what's implemented, what's planned, what's stale, what's orphaned. Produces a prioritised list of what to address next. Run it before a release, after a refactor, or when you suspect the specs have drifted from the code.

---

## I'm ready to cut a release

```
/tr-release patch
/tr-release minor
```

Pre-flight checks, changelog entry, version bump, commit, tag, push. Triggers CI and npm publish. Fails fast if the working tree is dirty, versions are out of sync, or the build is broken.
