# Patterns

Reusable patterns for extending and enforcing the taproot hierarchy. Each pattern solves a recurring problem — use them as building blocks rather than reinventing them.

---

## Incremental behaviour delivery

**Problem:** A behaviour spec has more acceptance criteria than can be delivered in one iteration — for example, an authentication behaviour covers password, MFA, OAuth, and passkey, but only password is in scope now. Without a clear convention, teams either silently skip ACs, over-scope the iteration, or lose track of what was deferred.

**Two patterns — choose based on flow shape:**

**Pattern A — Sub-behaviour decomposition** (preferred when deferred ACs have different flows, actors, or preconditions):
```
user-authentication/
  intent.md
  password-login/
    usecase.md        ← specified + implemented
  mfa-login/
    usecase.md        ← state: deferred
  oauth-login/
    usecase.md        ← state: deferred
```
Use `/tr-ineed` to decompose and create sub-behaviours. Set deferred ones to `state: deferred`. Each sub-behaviour has its own DoD gate. `/tr-status` and `/tr-next` surface deferred items for future iterations.

**Pattern B — AC-scoped impl** (when all ACs share the same flow shape):
Keep one `usecase.md`. Create `impl.md` for the in-scope ACs. In `## Design Decisions`, name which ACs are covered. At DoD time, resolve each deferred AC explicitly:
```
condition: AC-2 (MFA) | note: deferred — not in scope for this release | resolved: 2026-03-29
```

**Decision rule:** If unsure, default to Pattern A — sub-behaviours are easier to merge than to split.

**When to use it:**
- Any time you write a behaviour spec and know upfront that only a subset of ACs will be implemented now
- Any time an agent asks "we only have time for X — how do we handle the rest?"

**Signal phrases** (pattern-check will match these):
- "start with / implement part of / phase the delivery"
- "defer some ACs / not all ACs in scope / implement incrementally"
- "only do password for now / first version / MVP of this behaviour"

See full spec: `taproot/specs/requirements-hierarchy/incremental-behaviour-implementation/usecase.md`

---

## Cross-cutting constraint enforcement (`check-if-affected-by`)

**Problem:** You have an architectural rule that should apply to every implementation — not just a one-time concern, but a standing requirement. Examples: every skill must include a session hygiene signal; every skill that produces output must present a **What's next?** block; every implementation must satisfy a security review checklist. Writing this rule in a README or CLAUDE.md makes it aspirational. You want it enforced automatically, at commit time, for every new implementation.

**Pattern:** Define the rule as a behaviour spec (`usecase.md`), then add a `check-if-affected-by` entry to `taproot/settings.yaml`.

```yaml
# taproot/settings.yaml
definitionOfDone:
  - check-if-affected-by: skill-architecture/context-engineering
```

When the DoD runner encounters this condition, it instructs the agent to:
1. Read `taproot/skill-architecture/context-engineering/usecase.md`
2. Determine whether the current implementation is affected
3. If yes — verify compliance and apply corrections; if no — record "not applicable" with a reason

**When to use it:**
- The rule is architectural (applies across many implementations, not one)
- Compliance is agent-verifiable (the rule can be checked by reading the spec and the impl)
- The rule governs *how something is built*, not *what is built*

**Taproot's built-in uses:**

| Condition | Spec | What it enforces |
|---|---|---|
| `check-if-affected-by: human-integration/contextual-next-steps` | `taproot/human-integration/contextual-next-steps/usecase.md` | Every skill that produces output ends with a **What's next?** block |
| `check-if-affected-by: human-integration/pause-and-confirm` | `taproot/human-integration/pause-and-confirm/usecase.md` | Skills that write multiple documents pause for developer confirmation between each |
| `check-if-affected-by: skill-architecture/context-engineering` | `taproot/skill-architecture/context-engineering/usecase.md` | Skill files meet context-efficiency constraints (description ≤50 tokens, on-demand loading, `/compact` signal) |

**How to add a new cross-cutting constraint:**

1. Write the spec — `/tr-behaviour taproot/<your-intent>/ "<rule>"` — define what compliance looks like, what non-compliance looks like, and how to resolve it
2. Add to `taproot/settings.yaml`:
   ```yaml
   definitionOfDone:
     - check-if-affected-by: <intent-slug>/<behaviour-slug>
   ```
3. On the next implementation commit, the agent reads the spec and evaluates compliance automatically

**Note:** All existing `impl.md` files that were completed before the condition was added will show the condition as unresolved the next time their source files are committed. This is intentional — it backfills compliance on the next touch.

---

## Scoped conditions (`when: source-matches:`)

**Problem:** A cross-cutting condition is relevant only to specific implementation types — for example, a skill-file style guide applies only to impls whose `## Source Files` include `skills/*.md`. Without scoping, every other implementation in the project must record a repetitive "not applicable" resolution, adding noise to DoD runs.

**Pattern:** Add a `when: source-matches: "<glob>"` qualifier to any condition in `definitionOfDone` or `definitionOfReady`.

```yaml
definitionOfDone:
  - check-if-affected-by: skill-architecture/context-engineering
    when:
      source-matches: "skills/*.md"
  - check-if-affected-by: api-design/rest-conventions
    when:
      source-matches: "src/api/**/*.ts"
```

The glob is matched against the paths listed in the impl's `## Source Files` section:
- **Match** → condition runs exactly as if no `when:` qualifier were present
- **No match** → condition is auto-resolved as `not applicable — no source files match \`<glob>\`` with no agent work
- **No `## Source Files` section** → all scoped conditions auto-resolve as `not applicable — impl has no ## Source Files section`

**When to use it:**
- The condition only makes sense for a specific implementation type (skill files, API handlers, CLI commands)
- You have multiple implementation types sharing the same settings.yaml, and most are not affected by the condition
- The manual "not applicable" resolutions are adding noise without value

**Glob syntax:** `*` matches any characters except `/`; `**` matches across directory separators. Same conventions as `.gitignore`.

**Limitation:** Scoping is based on listed source file paths — it does not read the files themselves. If an impl omits a file from `## Source Files`, that file is not considered for matching.

---

## Specific file impact tracking (`check-if-affected`)

**Problem:** Certain files need manual review whenever the codebase changes — a docs index, a CLI help text, a skill guide. You want the DoD to prompt the implementer to check them, without making the check fully automated.

**Pattern:** Add a `check-if-affected` entry pointing to the file.

```yaml
definitionOfDone:
  - check-if-affected: src/commands/update.ts
  - check-if-affected: skills/guide.md
```

The agent is asked: "Does this implementation require changes to `<file>`?" If yes, it makes the changes. If no, it records why not.

**When to use it:**
- A specific file is a known integration point that frequently needs updating
- The check is simpler than a full behaviour spec (no complex compliance criteria)
- Use `check-if-affected-by` when the rule is architectural; use `check-if-affected` when the concern is a specific file

---

## Research before speccing (`/tr-research`)

**Problem:** A requirement touches an unfamiliar domain — an algorithm, a third-party protocol, an existing library ecosystem. Writing a behaviour spec without domain knowledge produces vague, incorrect, or redundant requirements.

**Pattern:** Run `/tr-research <topic>` before `/tr-behaviour`. The research skill scans local resources, searches the web, and optionally grills a domain expert. It produces a structured synthesis (local sources, web sources, key conclusions, open questions, references) that can be saved as a citable document or fed directly into a spec.

```
/tr-research "satellite tracking algorithms"
→ scan local docs, web search, expert grilling
→ save as taproot/research/satellite-tracking-algorithms.md
→ /tr-behaviour taproot/navigation/ "satellite tracking" (with research context)
```

`/tr-ineed` triggers research automatically when it detects a knowledge-intensive domain — so you often get this for free.

**When to use it:**
- The domain is unfamiliar (new algorithm, new protocol, new library)
- Existing libraries may already solve the problem (avoid reinventing the wheel)
- The spec author is not a domain expert and an expert is available to grill

---

## Open-ended agent questions (`check:`)

**Problem:** You have a one-off question the agent should reason about at DoD (or DoR) time — something too project-specific to warrant a full behaviour spec, but important enough to enforce at every commit. Examples: "should this story be split?", "does this change affect the public API contract?", "is there a simpler approach we haven't considered?".

**Pattern:** Add a `check:` entry to `definitionOfDone` (or `definitionOfReady`) in `taproot/settings.yaml`.

```yaml
definitionOfDone:
  - check: "does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml?"
  - check: "does this story reveal a reusable pattern worth documenting in docs/patterns.md?"
```

The agent reads the question text, reasons whether the answer is yes, no, or not applicable for the current implementation, and calls `taproot dod --resolve "check: <text>" "<what was done or why it does not apply>"`.

**When to use it:**
- The question is project-specific (not architectural enough to justify a full spec)
- The question has an action: if yes, the agent *does something* (adds to config, updates docs, flags a concern)
- Use `check-if-affected-by` when the rule applies to many implementations; use `check:` for one-off reasoning prompts

**Taproot's built-in defaults:**

| Question | Action if yes |
|---|---|
| `does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml?` | Agent adds the entry to `taproot/settings.yaml` |
| `does this story reveal a reusable pattern worth documenting in docs/patterns.md?` | Agent adds a pattern entry to `docs/patterns.md` |

---

## Autonomous mode preamble (`## Autonomous mode` section in skills)

**Problem:** A skill has one or more confirmation prompts (plan approval, staging confirmation, DoD resolution prompts). You want the same skill to work in both interactive and non-interactive (CI, headless agent) contexts without maintaining two versions.

**Pattern:** Add an `## Autonomous mode` section at the top of the skill file (before `## Steps`) that tells the agent to check for autonomous mode activation and apply autonomous notes throughout the steps.

```markdown
## Autonomous mode

Before following any steps, check whether autonomous mode is active:
- `TAPROOT_AUTONOMOUS=1` is set in the environment, **or**
- `--autonomous` was passed as an argument to this skill invocation, **or**
- `taproot/settings.yaml` contains `autonomous: true`

If any of these is true, **autonomous mode is active** — apply the autonomous notes at each step where they appear. If none is true, autonomous mode is **inactive** — show confirmation prompts as normal.
```

Then at each confirmation step, add a conditional note:

```markdown
**Interactive mode:** ask "Should I proceed?" and wait for confirmation.

**Autonomous mode:** proceed directly without waiting for confirmation.
```

**When to use it:**
- The skill has at least one confirmation prompt that would block unattended execution
- You want CI agents, headless runners, or `TAPROOT_AUTONOMOUS=1` users to be able to run the skill without interaction
- The skill already exists and works correctly in interactive mode — this is an additive change

**When NOT to use it:**
- The confirmation prompt exists to prevent destructive irreversible actions (e.g. deleting data, force-pushing) — in these cases, autonomous bypass is unsafe
- The skill is already fully automated (no prompts) — the preamble adds noise without value

**Taproot's built-in uses:**

| Skill | Prompt bypassed in autonomous mode |
|---|---|
| `skills/implement.md` | Plan approval in step 4 |
| `skills/commit.md` | Staging confirmation in step 3 |

---

## Agent-verified pre-commit check (`taproot truth-sign`)

**Problem:** A pre-commit hook needs to enforce a quality rule that requires semantic reasoning — something a shell command cannot evaluate alone (e.g. "does this spec contradict any active global truths?"). Running an LLM inside a hook is too slow and requires credentials.

**Pattern:** Separate the reasoning from the enforcement:
1. The skill performs the semantic check (via the agent) before `git commit` is called
2. If the check passes, the skill runs `taproot truth-sign` to write a session marker (`taproot/truth-checks.md`) containing a SHA-256 hash of the checked content
3. The hook validates the marker exists and matches the current staged state — a fast, deterministic check

```bash
# In the skill (after agent approves):
taproot truth-sign

# In the hook (synchronous, no LLM needed):
# validateTruthSession(cwd, stagedDocs, truths)
```

**When to use it:**
- The quality rule requires reasoning the CLI cannot perform alone
- The agent is always in the loop (via a skill) before the commit reaches the hook
- Content-hash binding is sufficient — the hook does not need to know *why* the check passed, only that it did for this exact content

**Limitation:** If the developer bypasses the skill and runs `git commit` directly, the hook blocks. This is intentional — the pattern enforces use of the skill as the authoritative commit path.

**Taproot's built-in uses:**

| Hook check | Written by | Validates |
|---|---|---|
| Truth consistency | `taproot truth-sign` (called by `/tr-commit`) | Staged hierarchy docs are consistent with `taproot/global-truths/` |

---

## Global truths are live commit constraints

**Problem:** An agent loads `taproot/global-truths/` when authoring a spec but treats it as optional reference material — not realising that any spec or implementation that contradicts an applicable truth will be **blocked at commit time** by the commithook. The agent writes a spec that contradicts a business rule, `/tr-commit` runs, and the commit fails.

**How it works:**
- Every file in `taproot/global-truths/` is a live constraint, scoped to the hierarchy level(s) it applies to
- When you run `/tr-commit`, it checks the staged content against applicable truths and calls `taproot truth-sign` to record the result
- The commithook then validates the session marker — if truths were not checked, or if the content changed since the check, the commit is blocked
- Bypassing `/tr-commit` and running `git commit` directly will be blocked if applicable truths exist and no valid session marker is present

**Practical implication for agents:**
When step 1b (behaviour authoring) or step 3a (implementation) loads truths and finds a contradiction, **resolve it before continuing** — not at the end of the session. A contradiction noted and left unresolved will block the commit.

**Signal phrases that indicate this pattern applies:**
- "global truths are checked at commit time"
- "why is the commit blocked by a truth"
- "what does taproot truth-sign do"
- "our truths are being enforced but I didn't know"

**What `/tr-commit` does automatically:**
1. Collects staged hierarchy docs and applicable truth files
2. Agent reviews consistency (already done at authoring time in step 1b/3a)
3. Runs `taproot truth-sign` to record the session marker
4. Commithook validates the marker — fast, no LLM needed

See also: `taproot/specs/global-truth-store/enforce-truths-at-commit/usecase.md`

---

## CLI prompt copy length

**Problem:** A prompt added to `taproot init` (or any CLI wizard) is significantly longer than sibling prompts, making the terminal output inconsistent and harder to scan.

**Convention:** Init and wizard prompts must fit within ~80 characters (excluding the `? ` prefix and the trailing option suffix like `(Y/n)` or `(yes)`). The message text itself is the constraint — parenthetical detail, rationale, and examples belong in docs, not in the prompt string.

**Before:**
```
? Install the pre-commit hook? (Strongly recommended — prevents implementation commits without traceability and requirement commits without quality checks) (Y/n)
```

**After:**
```
? Install the pre-commit hook? (Strongly recommended) (Y/n)
```

**When to use it:**
- Any new prompt added to `src/commands/init.ts` or other CLI wizard flows
- Any existing prompt that feels noticeably longer than its neighbours

---

## Structured design constraints (`/tr-define-truth`)

**Problem:** You want to define your project's architectural decisions, design principles, naming conventions, or external constraints before writing specs — but a flat note is hard to reason about. An ADR with context, options, and consequences is actionable.

**Four structured formats** (available via `/tr-define-truth` → Structured path):

| Format | What it captures | Default scope | Example |
|---|---|---|---|
| **Decision** (ADR) | A choice made from options | impl | "We use PostgreSQL over SQLite — context, options, decision, consequences" |
| **Principle** | A design value with rationale and examples | intent | "Fail early — surface failures before long operations; correct/violation examples" |
| **Rule / Convention** | A specific do/don't with right/wrong examples | impl | "Never log auth tokens — in any log level; correct/incorrect examples" |
| **External constraint** | Imposed from outside; not your team's choice | intent | "Must use corporate SAML IdP — client contract; implications; review date" |

**How to use it:**
```
/tr-define-truth
```
When describing a truth, `/tr-define-truth` detects structured formats and offers guided prompts for each type. It appends to existing truth files, checks for contradictions, and offers a completeness check at session end.

**Signal phrases** (pattern-check will match these):
- "define our architecture / record our tech choices / document our decisions"
- "UX guidelines / design principles / accessibility principles"
- "project conventions / coding standards / naming rules"
- "external constraint / we have to use / imposed on us / client requires"
- "what's the right way to capture our..."

See spec: `taproot/specs/global-truth-store/define-truth/usecase.md`

---

## Cross-repo specification sharing

**Problem:** A system spans multiple repositories. Specs that describe shared behaviour live in one repo, but other repos need to implement — and trace — them independently. Duplicating specs creates drift; leaving them only in the source repo means implementing repos have no local coverage record.

**Pattern:** A **link file** in the implementing repo points to the spec in the source repo. A local `impl.md` references the link file as its source — making coverage counting entirely local. The source repo creates a `delegated` impl.md to mark the ACs that another repo handles.

**Variants:**
- **Main repo with satellites** — one repo owns shared specs and some implementations; satellite repos link to it
- **Coordination repo** — a requirements-only repo owns all specs; all implementing repos link to it
- **Shared truths only** — repos don't share specs, just global truths (API contracts, domain models) via `Type: truth` link files

**When to use it:**
- A behaviour is implemented across multiple repos and you need independent coverage on each side
- You have a canonical domain model or API contract that must be enforced at commit time in several repos

Full documentation and setup checklist: [docs/cross-repo.md](cross-repo.md)

---

## Cross-repo change handoff

**Problem:** An agent working in repo A identifies that repo B needs a change — a truth update, a spec amendment, an API contract extension. Without a clear convention, the agent either silently proceeds (creating drift) or reaches directly into repo B's files (unauthorized modification with no review or traceability).

**Pattern:** Surface a structured handoff block and stop. The block contains everything the developer needs to act in the other repo — no cross-repo writes by the agent.

```
Cross-repo change needed
─────────────────────────────────────────────
Repo:    https://github.com/org/target-repo
File:    taproot/global-truths/api-contract_impl.md
Change:  Add `base_ref` field to the scan submission payload
Why:     Local implementation now sends base_ref; target contract must document it
Action:  Run taproot validate-format in the source repo; linking repos re-validate at next commit
```

**Action field** is derived from the relationship type:
- Truth link target → `Run taproot validate-format in the source repo; linking repos re-validate at next commit`
- Behaviour/intent link target → `Update spec and notify linking repos of the change`
- No formal link → `Open target repo, apply change, verify with target repo maintainer`

**When to trigger:**
- **Explicit** — developer or agent states directly that a change is needed
- **Inferred** — agent detects a concrete conflict (e.g. local code now contradicts a linked truth, or a spec change breaks a linked behaviour)
- **Not speculative** — if uncertain, ask "Is it clear that [repo] needs to change?" before presenting the block

**Blocking vs non-blocking:**
- If the current task cannot proceed without the upstream change: add `Blocking: yes` to the block and pause the session
- If non-blocking: present the block then offer to defer to `taproot/backlog.md`

**Autonomous mode:** Capture the block to `taproot/backlog.md` silently; add a `## Notes` entry to the current `impl.md`: "Autonomous session — cross-repo change captured to backlog: [summary]"

**When to use it:**
- Agent detects a linked truth needs updating to accommodate local changes
- Agent implements a spec that requires a contract change in a source repo
- Agent working in a linking repo realises the source repo's spec is stale relative to the implementation

See full spec: `taproot/specs/cross-repo-specification/signal-cross-repo-change/usecase.md`

---

## What belongs in `taproot/global-truths/`

**Problem:** You know you want to capture project-wide facts in `taproot/global-truths/` but aren't sure what kinds of facts are worth formalising — or how to scope them.

**The five starting categories:**

| Category | Default scope | What it contains | Example |
|---|---|---|---|
| **Glossary** | intent | Canonical names for domain concepts — disambiguates terms that have different meanings in different contexts | "A *session* is a continuous authenticated user period, distinct from a request or a connection" |
| **Domain model** | intent | Entities, relationships, and invariants that are always true in the domain | "Every Order must have at least one LineItem. An Order without LineItems cannot be placed." |
| **Architecture decisions** | impl | Technology choices, infrastructure patterns, and constraints that govern implementation | "All async I/O uses the event-loop pattern; no blocking calls in the request path" |
| **Naming conventions** | intent or behaviour | Identifier patterns, casing rules, and naming standards that apply across specs and code | "Command identifiers use kebab-case. Internal types use PascalCase. No abbreviations except `id` and `url`." |
| **Business rules** | intent or behaviour | Eligibility criteria, constraints, and invariants that govern domain behaviour | "A user may not hold more than one active subscription per product tier" |

These five are starting categories, not an exhaustive constraint. Any fact that is stable, cross-spec, and would prevent misinterpretation if left implicit is a valid candidate.

**Default scope recommendations:**
- **intent** — fact applies everywhere (cross-cutting terms, domain invariants, naming conventions)
- **behaviour** — fact governs observable system behaviour but not implementation choices
- **impl** — fact governs how something is built (tech stack, patterns, infrastructure)

**When NOT to capture a fact as a global truth:**
- It appears in only one spec — keep it as a note in that spec's `usecase.md`
- It describes *how* something is implemented (a detail), not *what is true* (a rule)
- It is ephemeral or likely to change frequently
- It can be derived directly by reading the code

**How to start:**
```
/tr-define-truth
```
On first invocation in a project with no existing truths, the skill walks you through the five categories and creates scoped starter files for the ones that apply. You populate them with your project's facts in free-form markdown.

---

## Quality module

**Problem:** A project wants agents to apply consistent quality conventions — UX patterns, security checklists, accessibility rules — automatically at implementation time, without hardcoding the rules into the core taproot workflow or burdening projects that don't need a given domain.

**Pattern:** Bundle related conventions as a module of skill files. Each module has one orchestrator skill and one sub-skill per domain aspect. Each sub-skill writes a scoped global truth file to `taproot/global-truths/`. The truth files are enforced at commit time. An optional DoD condition wires the check into every implementation commit.

**Module structure:**
```
skills/
  ux-define.md          ← orchestrator: scans coverage, routes to sub-skills, offers DoD wiring
  ux-orientation.md     ← sub-skill: elicits orientation conventions, writes ux-orientation_behaviour.md
  ux-flow.md            ← sub-skill: elicits flow conventions, writes ux-flow_behaviour.md
  ...
```

**Activation:**
1. User runs `/tr-<module>-define` (e.g. `/tr-ux-define`)
2. Orchestrator presents coverage status across all aspects
3. For each aspect, sub-skill elicits conventions through targeted questions + codebase discovery
4. Sub-skill writes `taproot/global-truths/<module>-<aspect>_behaviour.md` with conventions + agent checklist
5. Orchestrator offers to add `check-if-affected-by: taproot-modules/<module>` to `taproot/settings.yaml`
6. On next implementation commit, agents read the spec and verify applicable truth-file conventions

**When to use it:**
- A quality domain has 3+ orthogonal aspects that each need their own elicitation questions
- Conventions differ between projects (can't be hardcoded) — must be elicited per-project
- You want agent-driven checking at commit time without hard hook enforcement
- The domain is optional — projects that don't need it should not be burdened

**Examples in taproot:**

| Module | Orchestrator | Domain |
|--------|-------------|--------|
| `taproot-modules/user-experience` | `/tr-ux-define` | UX: orientation, flow, feedback, input, presentation, language, accessibility, adaptation, consistency |

**Signal phrases** (pattern-check will match these):
- "conventions agents should follow / checklist for every impl"
- "optional quality module / install a module"
- "elicit conventions for this domain / capture our [UX / security / architecture] rules"

See spec: `taproot/specs/taproot-modules/intent.md`
Full docs: `docs/modules.md`

---

## Mid-session expertise assistance (`[?] Get help`)

**Problem:** A skill asks the developer a domain question they cannot confidently answer — e.g. "What copy tone should this product use?" or "What are your quality goals?" A developer unfamiliar with UX, marketing, security, or the specific domain is left with an open-ended question and no guidance.

**Pattern:** At any question in a skill where the answer requires domain knowledge the developer may not have, offer `[?] Get help` as an option alongside the normal answers. When selected, the agent:
1. Scans existing project context — specs, codebase, existing truths — for evidence relevant to the question
2. Draws on domain knowledge for the question's subject area
3. Presents a structured proposal: what the project already shows, a concrete draft answer with one-paragraph reasoning, and one or two alternatives with trade-offs
4. Developer confirms the draft, adjusts wording, or rejects and provides their own answer

```markdown
> What copy tone should this product use?
> (friendly/casual, professional/formal, technical/precise, terse)
>
> **[?]** Get help — agent will scan project and propose
```

On `[?]`: scan for tone signals in existing content; propose with explanation; developer confirms or adjusts.

**When to use it:**
- A skill question requires domain expertise (UX, security, accessibility, marketing, legal, architecture)
- The developer's answer affects downstream conventions or truth files — a wrong answer has lasting impact
- The question is open-ended enough that an informed proposal is more useful than rephrasing the question

**Signal phrases** (pattern-check will match these):
- "developer may not know / lacks domain expertise"
- "question requires domain knowledge / hard to answer without background"
- "get help from agent / agent can propose an answer"

See spec: `taproot/specs/human-integration/agent-expertise-assistance/usecase.md`
See spec: `taproot/specs/taproot-modules/module-context-discovery/usecase.md` (first implementation)
