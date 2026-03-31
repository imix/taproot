# Agent Internals

How taproot's agent skills work under the hood. Reference for contributors and advanced users.

---

## Requirement routing (`/tr-ineed`)

When `/tr-ineed` receives a requirement it runs a two-phase process:

1. **Classification** — determines whether the requirement is clear enough to place immediately or vague enough to need discovery. Vague requirements go through a structured conversation: problem statement, persona, success criteria, scope boundary.
2. **Placement** — searches the existing hierarchy for near-duplicates, proposes a location (new intent vs. child behaviour under an existing intent), then delegates to `/tr-intent` or `/tr-behaviour` to write the document.

If you already know what you want and where it goes, call `/tr-intent` or `/tr-behaviour` directly.

---

## Top-down feature development

```
/tr-ineed "users need to reset their password without contacting support"
/tr-audit taproot/password-reset/intent.md
/tr-implement taproot/password-reset/request-reset/
taproot coverage --path taproot/password-reset/
```

1. **`/tr-ineed`** — routes the requirement: writes `intent.md` with goal, stakeholders, and success criteria, then offers to decompose it into behaviours. Asks clarifying questions before writing.
2. **`/tr-audit`** — stress-tests the intent: challenges success criteria, surfaces scope ambiguity, flags missing stakeholders. Run before writing behaviours.
3. **`/tr-implement`** — for one behaviour at a time: writes the code, writes the tests, creates `impl.md`, and commits using the conventional tag format.
4. **`taproot coverage`** — shows what's implemented vs. still planned.

---

## Bottom-up investigation

```
/tr-trace src/auth/password-reset.ts
/tr-refine taproot/password-reset/request-reset/ "missing rate limit allows spam"
/tr-implement taproot/password-reset/request-reset/
```

1. **`/tr-trace`** — navigates from a source file up through impl → behaviour → intent, showing the full context: why the code exists, what behaviour it implements, what the success criteria are. Also works top-down and laterally across siblings.
2. **`/tr-refine`** — updates the behaviour spec with post-implementation learnings or bug findings. Keeps the spec honest before you fix the code.
3. **`/tr-implement`** — re-implements the behaviour with the updated spec as the source of truth.

---

## Onboarding an existing codebase

```
/tr-discover
```

Works in phases:

1. **Orient** — reads README, package manifests, and any existing taproot documents
2. **Intents** — proposes top-level business intents one at a time, asking a probing question about each
3. **Behaviours** — for each confirmed intent, reads source code and proposes use cases
4. **Implementations** — for each confirmed behaviour, identifies source files, tests, and commits, then writes `impl.md`

You confirm each proposed item before anything is written. Discovery can be stopped and resumed — it saves a status file after each confirmed item.

Use the `depth` argument to limit scope: `intents-only` for a quick intent capture session, `behaviours` to stop before writing impl records.

---

## Impact analysis before changes

Before editing a behaviour or intent that already has implementations, the analyse-change skill walks the hierarchy below the artifact and identifies: which implementations would break, which sibling behaviours share preconditions, and what tests would need updating. It is called automatically by `/tr-ineed`, `/tr-refine`, and `/tr-promote` when they detect a potentially breaking change.

---

## Surfacing implicit truths

```
/tr-discover-truths
```

Scans all `intent.md` and `usecase.md` files for recurring terms, business rules, and conventions not yet defined in `taproot/global-truths/`. For each candidate: **promote** (routes to `/tr-define-truth`), **backlog**, **skip**, or **dismiss**.

Truth discovery also runs as a final pass inside `/tr-audit-all`.

---

## Stress-testing before committing

```
/tr-grill-me
```

An adversarial interview for plans and designs before they become specs. The agent interviews you one decision branch at a time — always providing a recommended answer — until every significant trade-off is worked through. Produces a decision summary for use as input to `/tr-intent` or `/tr-behaviour`.

---

## CLI health checks

```bash
taproot coverage --path taproot/password-reset/
taproot check-orphans
taproot sync-check
```

- **`taproot coverage`** — counts implementations vs. planned behaviours
- **`taproot check-orphans`** — finds folders missing marker files, source files no impl references, and commits not linked to any impl
- **`taproot sync-check`** — detects staleness: source files modified after `impl.md` was last verified, or specs reviewed after implementation completed

---

## Post-implementation spec maintenance

```
/tr-refine taproot/password-reset/request-reset/ "email service has a 10s timeout"
/tr-promote taproot/password-reset/request-reset/ "all email-sending features constrained by 10s timeout"
```

- **`/tr-refine`** — adds post-implementation learnings to a behaviour spec without changing its structure
- **`/tr-promote`** — escalates a finding to the intent level when it has implications for the business goal itself
