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
/tr-plan-execute
```

Use `/tr-plan` to build a prioritised list of work items from your backlog, unimplemented behaviours, or items you describe directly. The plan is saved to `taproot/plan.md` and persists across sessions.

When you're ready to execute, `/tr-plan-execute` works through the plan one item at a time — or in batch for items that don't need your input. Items requiring a human decision pause and wait; autonomous items run straight through.

Before executing a large plan, run `/tr-plan-analyse` to catch items that aren't ready (ambiguous specs, missing prerequisites, unresolved dependencies).

---

## I want to capture something without losing my flow

```
/tr-backlog "the export should also support JSON — low priority"
```

Drop an idea, finding, or deferred decision into `taproot/agent/backlog.md` mid-session. One command, no context switching. Items in the backlog feed into the next `/tr-plan` run.

---

## I want to analyse my specs

```
/tr-review taproot/password-reset/request-reset/usecase.md
/tr-review-all taproot/password-reset/
```

Use `/tr-review` to stress-test a single spec before you implement it — the agent challenges assumptions, asks adversarial questions, and flags coverage gaps. Use `/tr-review-all` on a subtree to catch contradictions between siblings and cross-check every intent criterion against the behaviours below it.

Run `/tr-review` on a fresh spec before starting implementation. Run `/tr-review-all` before a release or after significant scope changes.

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
