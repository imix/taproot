# Workflows

Taproot supports several development patterns. The right starting point depends on where you are: building something new, fixing a bug, joining an existing project, or onboarding a codebase that has no specs yet.

---

## I have an idea or requirement

Use `/tr-ineed` when you have a requirement but aren't sure where it belongs in the hierarchy, or when the requirement is vague and needs sharpening before you can write a spec.

```
/tr-ineed "users need to be able to export their data as CSV"
```

The agent classifies the requirement (clear vs. vague), searches the existing hierarchy for near-duplicates, and proposes the right placement. If the requirement is ambiguous or under-specified, it runs a structured discovery conversation — problem, persona, success criteria, scope boundary — before proposing a placement. It then calls `/tr-intent` or `/tr-behaviour` to write the actual document.

If you already know what you want and where it goes, skip `/tr-ineed` and call `/tr-intent` or `/tr-behaviour` directly.

---

## Building a new feature (top-down)

When you're starting from a business goal and working toward code, the typical sequence is:

```
/tr-intent "users need to reset their password without contacting support"
/tr-review taproot/password-reset/intent.md
/tr-decompose taproot/password-reset/
/tr-implement taproot/password-reset/request-reset/
taproot coverage --path taproot/password-reset/
```

1. **`/tr-intent`** — writes `intent.md` with goal, stakeholders, and success criteria. Asks clarifying questions before writing.
2. **`/tr-review`** — stress-tests the intent: challenges success criteria, surfaces scope ambiguity, flags missing stakeholders. Run this before writing behaviours — it's much cheaper to find gaps at the intent level.
3. **`/tr-decompose`** — breaks the intent into a set of behaviours (UseCases). Each behaviour covers one observable thing the system does. For each proposed behaviour the agent asks a probing question to validate it's a real, testable system behaviour — not a technical module.
4. **`/tr-implement`** — for one behaviour at a time: writes the code, writes the tests, creates `impl.md`, and commits using the conventional tag format.
5. **`taproot coverage`** — shows what's implemented vs. still planned.

---

## Fixing a bug or investigating unexpected behaviour (bottom-up)

When you're starting from code and need to understand what it's supposed to do:

```
/tr-trace src/auth/password-reset.ts
/tr-refine taproot/password-reset/request-reset/ "missing rate limit allows spam"
/tr-implement taproot/password-reset/request-reset/
```

1. **`/tr-trace`** — navigates from a source file up through impl → behaviour → intent, showing you the full context: why this code exists, what behaviour it implements, what the success criteria are. Also works top-down (intent → impl) and laterally (sibling behaviours).
2. **`/tr-refine`** — updates the behaviour spec based on what you found. If the bug reveals a gap in the spec (e.g., rate limiting wasn't specified), refine adds it before you fix the code. This keeps the spec honest.
3. **`/tr-implement`** — re-implements the behaviour with the updated spec as the source of truth.

---

## Onboarding an existing codebase

If your project has working code but no taproot hierarchy, use `/tr-discover` to reverse-engineer one:

```
/tr-discover
```

The skill works in phases:

1. **Orient** — reads README, package manifests, and any existing taproot documents to understand the project
2. **Intents** — proposes top-level business intents one at a time, asking a probing question about each to validate it reflects a real business goal (not just a technical module)
3. **Behaviours** — for each confirmed intent, reads the source code and proposes use cases as observable system behaviours
4. **Implementations** — for each confirmed behaviour, identifies source files, tests, and commits, then writes `impl.md`

You confirm each proposed item before anything is written. Discovery can be stopped and resumed at any time — it saves a status file after each confirmed item.

Use the `depth` argument to limit scope: `intents-only` for a quick intent capture session, `behaviours` to stop before writing impl records.

---

## Health check and maintenance

```
/tr-status
```

Or via CLI:

```bash
taproot coverage && taproot check-orphans && taproot sync-check
```

- **`/tr-status`** — an AI-driven health dashboard: coverage by intent, orphaned files, stale specs, unlinked commits. Produces a prioritized list of what to address next.
- **`taproot coverage`** — counts implementations vs. planned behaviours across the hierarchy.
- **`taproot check-orphans`** — finds folders missing their marker files, source files that no impl references, and commits not linked to any impl.
- **`taproot sync-check`** — detects staleness: source files modified after the `impl.md` was last verified, or specs reviewed after the implementation was completed.

Run these before a release, after a refactor, or when you suspect the specs have drifted from the code.

---

## Keeping specs current after implementation

Implementations teach you things the spec didn't anticipate — edge cases, performance constraints, API quirks. Capture those learnings:

```
/tr-refine taproot/password-reset/request-reset/ "discovered that the email service has a 10s timeout"
/tr-promote taproot/password-reset/request-reset/ "all email-sending features are constrained by the 10s timeout"
```

- **`/tr-refine`** — updates a behaviour spec with post-implementation learnings. Preserves the existing spec structure; only adds or adjusts what changed.
- **`/tr-promote`** — escalates a finding to the intent level. Use when something discovered during implementation has implications for the business goal itself (e.g., a third-party constraint that affects success criteria).

---

## Before making a significant change

Before editing a behaviour or intent that already has implementations, assess the impact:

```
/tr-analyse-change taproot/password-reset/intent.md
```

The skill walks the hierarchy below the artifact and identifies: which implementations would break, which sibling behaviours share preconditions, and what tests would need updating. Run this before refactoring an intent or splitting a behaviour.

---

## Stress-testing a spec

```
/tr-review taproot/password-reset/request-reset/usecase.md
/tr-review-all taproot/password-reset/
```

- **`/tr-review`** — stress-tests a single artifact: challenges assumptions, asks adversarial questions, identifies coverage gaps and contradictions.
- **`/tr-review-all`** — comprehensive review of an entire subtree: runs validation, checks orphans and staleness, cross-checks every intent criterion against the behaviours below it, and identifies duplication or contradictions across siblings.

Use `/tr-review` on a fresh spec before starting implementation. Use `/tr-review-all` before a release or after significant scope changes.

---

## When you need to think something through

```
/tr-grill-me
```

Use `/tr-grill-me` when you want to stress-test a plan or design before committing it to a spec. The agent interviews you relentlessly — one decision branch at a time, always providing a recommended answer — until you've worked through every significant trade-off. Use it when:

- You have a rough idea for an architecture and want to pressure-test it
- You're about to write an intent for a domain you don't fully understand yet
- You want to surface assumptions before they become bugs

`/tr-grill-me` is a conversation, not a document. It produces a decision summary at the end, which you can use as input to `/tr-intent` or `/tr-behaviour`.
