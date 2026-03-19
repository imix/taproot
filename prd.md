# Taproot — Product Requirements Document

*Requirements as the root system of your codebase.*

## 1. Overview

### Problem

AI-assisted coding tools generate code fast but lose track of *why* the code exists. Requirements drift, specs go stale, and traceability from business intent to implementation disappears. Existing approaches (BMAD, Spec Kit, Kiro, AI Unified Process) all converge on "specs should be the source of truth" but none solve the maintenance problem: how to keep a complete, current, navigable set of requirements synchronized with the actual codebase.

### Solution

**Taproot** is a folder-based requirement hierarchy with three layers — **intent**, **behaviour**, **implementation** — stored in the repository alongside code. Each layer has a defined document format. The system includes CLI helper scripts for structural validation and AI agent skills for semantic operations on the hierarchy. Taproot is **agent-agnostic** — the skills are portable markdown instructions that work with Claude Code, Cursor, GitHub Copilot, Windsurf, or any AI coding assistant that supports custom system prompts or project context.

### Design Principles

- **Folder hierarchy IS the data model.** No database, no external tool. The filesystem is the source of truth, versioned with git alongside the code it describes.
- **Scripts handle structure, AI handles semantics.** Deterministic scripts validate format, check links, find orphans. AI skills create content, trace relationships, and refine specs from implementation learnings.
- **Every piece of code traces back to an intent.** The hierarchy answers both "what does this goal require?" (top-down) and "why does this code exist?" (bottom-up).
- **Recursive nesting.** A behaviour can contain sub-behaviours. An intent can contain sub-intents. The tree grows as understanding deepens, without changing the model.
- **Agent-agnostic by design.** Skills are self-contained markdown instructions, not IDE plugins. The CLI scripts have no AI dependency. Any agent that can read files, write files, and run shell commands can operate Taproot. Agent-specific wiring (slash commands, custom modes, rules files) is a thin adapter layer, not core logic.

---

## 2. Folder Structure

```
taproot/
├── CONTEXT.md                             # Auto-generated hierarchy summary (for agent context)
├── CONVENTIONS.md                         # Auto-generated format & commit reference
├── _brainstorms/                          # Exploratory brainstorm docs (not part of hierarchy)
│   └── <brainstorm-slug>.md
├── skills/                                # Canonical skill definitions (agent-agnostic)
│   ├── brainstorm.md
│   ├── grill.md
│   ├── grill-all.md
│   ├── intent.md
│   ├── behaviour.md
│   ├── implement.md
│   ├── trace.md
│   ├── status.md
│   ├── refine.md
│   ├── promote.md
│   └── decompose.md
├── <intent-slug>/
│   ├── intent.md                          # Goal, stakeholders, success criteria
│   ├── <behaviour-slug>/
│   │   ├── usecase.md                     # Actor, preconditions, flows, postconditions
│   │   ├── <implementation-slug>/
│   │   │   └── impl.md                    # Commit refs, test refs, design decisions
│   │   ├── <implementation-slug>/
│   │   │   └── impl.md
│   │   └── <sub-behaviour-slug>/          # Nested behaviour (recursive)
│   │       ├── usecase.md
│   │       └── <implementation-slug>/
│   │           └── impl.md
│   └── <behaviour-slug>/
│       ├── usecase.md
│       └── ...
└── <intent-slug>/
    ├── intent.md
    └── ...
```

### Naming Conventions

- Folder names: lowercase kebab-case, descriptive slugs (e.g., `user-onboarding`, `register-account`, `email-validation`)
- Each folder type is identified by the file it contains: `intent.md` = intent folder, `usecase.md` = behaviour folder, `impl.md` = implementation folder
- No folder may contain more than one of these marker files (a folder is exactly one type)

---

## 3. Agent-Agnostic Architecture

Taproot is designed to work with **any AI coding assistant**, not just one. The architecture has three layers, and only the outermost is agent-specific.

### Layer 1: CLI Scripts (No AI dependency)

The `taproot` CLI is a standalone Node.js tool. It validates structure, checks formats, links commits, reports coverage. It has zero AI calls and zero agent coupling. Any developer can run `taproot coverage` from a terminal regardless of which AI tool they use (or if they use none at all).

### Layer 2: Skill Definitions (Agent-agnostic markdown)

Each skill (intent, behaviour, implement, trace, etc.) is defined as a **self-contained markdown file** that describes the skill's purpose, inputs, outputs, step-by-step behaviour, and which CLI commands to run. These are the canonical definitions — they live in the Taproot repository and are the single source of truth.

```
taproot/
  skills/
    intent.md            # Canonical skill definition
    behaviour.md
    implement.md
    trace.md
    brainstorm.md
    grill.md
    ...
```

These files are written in a structured format that any AI agent can interpret:

```markdown
# Skill: intent

## Description
Create or refine a business intent in the Taproot hierarchy.

## Inputs
- description: Natural language description of the goal (required)
- path: Path to existing intent to refine (optional)

## Steps
1. If path is provided, read the existing intent.md at that path.
2. If no path, search existing intents under taproot/ for overlap...
3. ...
4. Run `taproot validate-format` to confirm the output is valid.

## Output
A new or updated intent.md in the correct folder location.

## CLI Dependencies
- taproot validate-format
- taproot validate-structure
```

### Layer 3: Agent Adapters (Thin, agent-specific wiring)

Each supported agent gets a thin adapter that maps Taproot skills to the agent's native extension mechanism. These are generated by `taproot init --agent <name>`.

| Agent | Adapter format | Skill invocation | Location |
|-------|---------------|-----------------|----------|
| Claude Code | `.claude/skills/taproot/*.md` + slash commands | `/taproot:intent` | `.claude/skills/taproot/` |
| Cursor | `.cursor/rules/taproot.md` + `@taproot` commands | `@taproot intent` | `.cursor/rules/` |
| GitHub Copilot | `.github/copilot-instructions.md` section | `@workspace /taproot-intent` | `.github/` |
| Windsurf | `.windsurfrules` + cascade entries | `/taproot:intent` | `.windsurfrules` |
| Generic | `AGENTS.md` / `INSTRUCTIONS.md` | Agent reads on startup | Project root |

**The adapter is a template, not code.** It imports the canonical skill definition and wraps it in the agent's expected format. When a skill definition changes, regenerating adapters is a single command:

```bash
taproot init --agent claude    # Generates Claude Code skills
taproot init --agent cursor    # Generates Cursor rules
taproot init --agent copilot   # Generates Copilot instructions
taproot init --agent generic   # Generates AGENTS.md for any agent
taproot init --agent all       # Generates all adapters
```

### Portable Context Files

Beyond adapters, Taproot generates shared context files that any agent benefits from reading:

- `taproot/CONTEXT.md` — Auto-generated summary of the current hierarchy state: how many intents, behaviours, implementations exist, what's in progress, what's stale. Regenerated by `taproot coverage --format context`. Agents that read project-level markdown on startup get instant awareness of the requirement landscape.
- `taproot/CONVENTIONS.md` — The Taproot document formats, commit conventions, and folder rules in a single file. An agent that reads this knows how to create valid Taproot artifacts even without a dedicated adapter.

---

## 4. Document Formats

### 4.1 Intent (`intent.md`)

Captures the business goal. Deliberately high-level — the "why" and "for whom," not the "how."

```markdown
# Intent: <Title>

## Stakeholders
- <Role>: <Name or team> — <their interest in this intent>

## Goal
<1-3 sentences describing the desired outcome from the stakeholder's perspective>

## Success Criteria
- [ ] <Measurable criterion 1>
- [ ] <Measurable criterion 2>

## Constraints
- <Constraint 1 (regulatory, technical, timeline, etc.)>

## Status
- **State:** draft | active | achieved | deprecated
- **Created:** <date>
- **Last reviewed:** <date>

## Notes
<Free-form context, links to external docs, meeting notes, etc.>
```

### 4.2 Behaviour (`usecase.md`)

Describes observable system behaviour in UseCase format. Each behaviour is testable.

```markdown
# Behaviour: <Title>

## Actor
<Who or what initiates this behaviour>

## Preconditions
- <What must be true before this behaviour can occur>

## Main Flow
1. <Step 1>
2. <Step 2>
3. <Step 3>

## Alternate Flows
### <Alternate flow name>
- **Trigger:** <When does this alternate flow occur?>
- **Steps:**
  1. <Step>
  2. <Step>

## Postconditions
- <What is true after successful completion>

## Error Conditions
- <Error scenario>: <Expected system response>

## Status
- **State:** proposed | specified | implemented | tested | deprecated
- **Created:** <date>
- **Last reviewed:** <date>

## Notes
<Edge cases, open questions, links to related behaviours>
```

### 4.3 Implementation (`impl.md`)

Links behaviour to code. This is the traceability bridge.

```markdown
# Implementation: <Title>

## Behaviour
<Relative path to parent usecase.md>

## Design Decisions
- <Decision 1: what was chosen and why>

## Source Files
- `<path/to/file.ts>` — <brief description of what this file does for this implementation>

## Commits
- `<hash>` — <one-line summary>
- `<hash>` — <one-line summary>

## Tests
- `<path/to/test-file.test.ts>` — <what scenarios this test covers>

## Status
- **State:** planned | in-progress | complete | needs-rework
- **Created:** <date>
- **Last verified:** <date>

## Notes
<Technical debt, known limitations, future improvements>
```

---

## 5. CLI Scripts (`taproot <command>`)

Deterministic CLI tools. No AI calls. Run fast, fail loud. All scripts are subcommands of the `taproot` CLI.

### 5.1 `taproot validate-structure`

**Purpose:** Verify the folder hierarchy follows nesting rules.

**Rules enforced:**
- A folder containing `usecase.md` (behaviour) must be a child of a folder containing `intent.md` (intent) or another behaviour folder (for sub-behaviours)
- A folder containing `impl.md` (implementation) must be a child of a behaviour folder
- No folder contains more than one marker file (`intent.md`, `usecase.md`, `impl.md`)
- No orphan folders (folders with no marker file, unless they contain child folders that do)
- Folder names match kebab-case pattern: `^[a-z0-9]+(-[a-z0-9]+)*$`

**Invocation:**
```bash
taproot validate-structure [--path taproot/] [--strict]
```

**Output:** Exit 0 if valid. Exit 1 with list of violations. `--strict` also warns on empty folders and missing optional fields.

### 5.2 `taproot validate-format`

**Purpose:** Validate that each marker file conforms to its schema.

**Rules enforced:**
- `intent.md` has required sections: Stakeholders, Goal, Success Criteria, Status
- `usecase.md` has required sections: Actor, Preconditions, Main Flow, Postconditions, Status
- `impl.md` has required sections: Behaviour, Commits, Tests, Status
- Status fields use allowed values
- Dates are valid ISO format
- Behaviour reference in `impl.md` points to an existing `usecase.md`

**Invocation:**
```bash
taproot validate-format [--path taproot/] [--fix]
```

**Output:** Exit 0 if valid. Exit 1 with list of violations and file:line references. `--fix` adds missing section headers with placeholder content.

### 5.3 `taproot check-orphans`

**Purpose:** Find disconnected nodes in the hierarchy.

**Detects:**
- Implementation folders whose parent is not a behaviour folder
- Behaviour folders with zero implementation children (reports as "unimplemented")
- Implementation files referencing commits that don't exist in git history
- Implementation files referencing test files that don't exist on disk
- Source files listed in `impl.md` that no longer exist

**Invocation:**
```bash
taproot check-orphans [--path taproot/] [--include-unimplemented]
```

**Output:** Grouped report: broken links, missing files, unimplemented behaviours.

### 5.4 `taproot link-commits`

**Purpose:** Update implementation records with commit references based on git history.

**Behaviour:**
- Scans git log for commits with conventional tags: `taproot(<intent>/<behaviour>/<impl>): <message>` or commit trailer `Taproot: <path>`
- Adds new commit hashes to the matching `impl.md` Commits section
- Does NOT remove existing commit references (manual curation only)
- Can run in `--dry-run` mode to preview changes

**Invocation:**
```bash
taproot link-commits [--since <date|hash>] [--dry-run] [--path taproot/]
```

### 5.5 `taproot coverage`

**Purpose:** Generate a completeness summary of the hierarchy.

**Output format:**
```
Intent: user-onboarding [active]
  ├─ register-account [tested] ████████████ 3/3 impl complete
  │  ├─ email-validation [complete, 2 commits, 1 test]
  │  ├─ password-policy [complete, 2 commits, 1 test]
  │  └─ verify-email [tested] ██████████── 1/1 impl complete
  │     └─ token-generation [complete, 1 commit, 1 test]
  ├─ choose-plan [implemented] ████████──── 3/3 impl, 0 tested
  │  ├─ plan-comparison-ui [complete, 2 commits, 0 tests] ⚠
  │  ├─ stripe-integration [complete, 1 commit, 0 tests] ⚠
  │  └─ trial-activation [complete, 2 commits, 0 tests] ⚠
  └─ sso-login [proposed] ──────────── 0/0 impl
```

**Invocation:**
```bash
taproot coverage [--path taproot/] [--format tree|json|markdown]
```

### 5.6 `taproot sync-check`

**Purpose:** Detect potential staleness between specs and code.

**Heuristics:**
- If source files listed in `impl.md` have been modified after `impl.md`'s last git commit date, flag as "potentially stale"
- If test files listed in `impl.md` have been deleted or significantly changed, flag as "test drift"
- If a `usecase.md` was edited after its child `impl.md` files, flag implementations as "spec updated, review implementation"

**Invocation:**
```bash
taproot sync-check [--path taproot/] [--since <date>]
```

### 5.7 `taproot init`

**Purpose:** Initialize Taproot in a project.

**Behaviour:**
- Creates `taproot/` directory
- Creates a `.taproot.yaml` config file with defaults
- Optionally adds a pre-commit hook that runs `taproot validate-structure` and `taproot validate-format`
- Optionally adds a CI workflow snippet (GitHub Actions)
- Optionally installs Claude Code skills to `.claude/skills/taproot/`

**Invocation:**
```bash
taproot init [--with-hooks] [--with-ci github|gitlab] [--with-skills]
```

---

## 6. AI Skills

Portable skill definitions that work across agents. The canonical definitions live in `taproot/skills/`. Agent-specific adapters (section 3) map these to slash commands, rules, or instructions.

Each skill below is described in terms of its trigger, steps, inputs, and outputs. The implementing agent reads the skill markdown and executes accordingly.

### Pre-Development Skills (Brainstorming & Validation)

These skills run *before* the hierarchy exists. They help shape vague ideas into well-formed intents.

### 6.1 `/taproot:brainstorm` — Explore and Expand an Idea

**Trigger:** User has a vague idea, a problem statement, or a domain they want to explore before committing to a specific intent.

**Behaviour:**
1. Accept a free-form description of the idea, problem, or opportunity
2. Ask expansive questions to map the problem space:
   - Who are all the potential stakeholders? (not just the obvious ones)
   - What adjacent problems exist?
   - What are the user's current workarounds?
   - What does success look like from different perspectives?
   - What similar systems or solutions exist?
3. Generate a structured brainstorm output:
   - Problem space map (related problems, stakeholders, constraints discovered)
   - Candidate intents (2-5 possible goals that emerged from the discussion)
   - Risks and unknowns surfaced during exploration
   - Suggested next step: which candidate intent to pursue first
4. Save the brainstorm as `taproot/_brainstorms/<slug>.md` (outside the main hierarchy — brainstorms are exploratory, not committed)
5. When the user is ready to commit, convert a candidate intent into a real intent via `/taproot:intent`

**Input:** Free-form description, domain context, or "I want to explore X."

**Output:** Structured brainstorm document with candidate intents. Does NOT create hierarchy entries — that requires explicit commitment.

### 6.2 `/taproot:grill` — Stress-Test Any Artifact

**Trigger:** User has a draft intent, behaviour, or implementation plan and wants it challenged before proceeding.

**Behaviour:**
1. Accept a path to any Taproot artifact (intent.md, usecase.md, impl.md) or a brainstorm document
2. Read the artifact and its context (parent intent, sibling behaviours, existing implementations)
3. Systematically challenge the artifact from multiple angles:

   **For intents:**
   - Is the goal measurable? Can you actually tell when it's achieved?
   - Are the success criteria specific enough, or could you declare victory without delivering value?
   - Who's missing from the stakeholder list? (Security team? Support? Operations?)
   - What happens if you *don't* build this? What's the cost of inaction?
   - Is this one intent or actually three intents in a trenchcoat?
   - What's the smallest version of this that would deliver value?

   **For behaviours (UseCases):**
   - What happens when step 2 fails? Is every error condition covered?
   - What's the performance expectation? 100ms? 10 seconds? Doesn't matter?
   - How does this behave under load? Concurrent users? Race conditions?
   - What data does this touch, and what happens if that data is malformed?
   - Is this UseCase actually two UseCases? Could the main flow be simpler?
   - What happens at the boundaries — first use, 10,000th use, edge of quota?

   **For implementations:**
   - Is the design decision justified, or is it "we always do it this way"?
   - What are the failure modes of the chosen approach?
   - Are the tests testing behaviour or implementation details?
   - What's not covered by tests that should be?
   - Will this implementation survive the next likely change to the behaviour spec?

4. Present findings as a prioritized list: blockers (must fix), concerns (should address), and suggestions (nice to have)
5. Offer to apply fixes directly via the appropriate skill (`/taproot:refine`, `/taproot:intent`, etc.)

**Input:** Path to any Taproot artifact.

**Output:** Structured critique with prioritized findings. Does NOT auto-modify — the user decides what to act on.

### 6.3 `/taproot:grill-all` — Sweep an Entire Subtree

**Trigger:** User wants a comprehensive review before a milestone, release, or sprint start.

**Behaviour:**
1. Accept a path to an intent or the entire `taproot/` root
2. Walk the subtree and run the grill logic on each artifact
3. Cross-check between artifacts:
   - Do all behaviours actually serve the parent intent's success criteria, or are some gold-plating?
   - Are there gaps — success criteria that no behaviour addresses?
   - Do implementations match their behaviour specs, or have they drifted?
   - Are there contradictions between sibling behaviours?
4. Produce a summary report with per-artifact findings and cross-cutting issues
5. Integrate with `taproot sync-check` and `taproot check-orphans` for a complete health picture

**Input:** Path to subtree or entire hierarchy.

**Output:** Consolidated review report with cross-cutting analysis.

---

### Hierarchy Management Skills

### 6.4 `/taproot:intent` — Create or Refine an Intent

**Trigger:** User wants to define a new business goal or revise an existing one.

**Behaviour:**
1. If given a vague description, ask clarifying questions about stakeholders, goals, and success criteria
2. Search existing intents for overlap. If a similar intent exists, ask whether to refine it or create a new one
3. Generate `intent.md` following the format spec
4. Create the intent folder under `taproot/`
5. Run `taproot validate-format` to confirm the output is valid
6. Suggest likely behaviours that would fulfill this intent (don't create them yet — let user confirm)

**Input:** Natural language description of the goal, or path to existing intent to refine.

**Output:** A new or updated `intent.md` in the correct folder location.

### 6.5 `/taproot:behaviour` — Define a Behaviour (UseCase)

**Trigger:** User wants to add a UseCase under an intent or under another behaviour.

**Behaviour:**
1. Accept a parent path (intent or behaviour folder) and a description
2. Read the parent intent/behaviour to understand the context
3. Read sibling behaviours to avoid duplication
4. Generate a UseCase through conversation — ask about actors, flows, edge cases, error conditions
5. Write `usecase.md` in a new behaviour folder
6. Run `taproot validate-structure` and `taproot validate-format`
7. If the behaviour decomposes naturally into sub-behaviours, suggest them

**Input:** Parent folder path + natural language description.

**Output:** A new `usecase.md` in a correctly nested behaviour folder.

### 6.6 `/taproot:implement` — Implement a Behaviour

**Trigger:** User wants to write code that satisfies a behaviour spec.

**Behaviour:**
1. Read the target `usecase.md` thoroughly — understand main flow, alternate flows, error conditions
2. Read any existing implementations under the same behaviour to understand what's already done
3. Enter plan mode: propose which files to create/modify, which tests to write, and how they map to UseCase steps
4. After user approval, write the code and tests
5. Create `impl.md` in a new implementation folder, pre-filled with source files, test references, and design decisions
6. Commit with conventional tag format: `taproot(<path>): <message>`
7. Run `taproot link-commits` to update the impl record
8. Run `taproot validate-structure`

**Input:** Path to a `usecase.md`.

**Output:** Working code, tests, and a properly linked `impl.md`.

### 6.7 `/taproot:trace` — Navigate the Hierarchy

**Trigger:** User wants to understand relationships — "why does this code exist?" or "what's left to build?"

**Behaviour:**
- **Bottom-up (from code):** Given a file path, find which `impl.md` references it, then walk up to the parent behaviour and intent. Display the full chain.
- **Bottom-up (from commit):** Given a commit hash, find which `impl.md` lists it, then walk up.
- **Top-down (from intent):** Given an intent, show all behaviours, their implementations, and current status. Essentially a narrative version of `taproot coverage`.
- **Lateral:** Given a behaviour, show sibling behaviours under the same parent, and cousin behaviours under sibling intents, to help understand scope and boundaries.
- **Unlinked:** Scan the codebase for source files not referenced by any `impl.md`. Group by directory/module and suggest behaviours that likely correspond to each group.

**Input:** A file path, commit hash, or Taproot folder path. Or `--unlinked` for reverse-engineering.

**Output:** A formatted trace showing the chain from intent → behaviour → implementation → code → tests.

### 6.8 `/taproot:status` — Coverage Dashboard

**Trigger:** User wants a high-level view of what's built, what's planned, what's missing.

**Behaviour:**
1. Run `taproot coverage` to get the raw data
2. Run `taproot check-orphans` to find problems
3. Run `taproot sync-check` to find staleness
4. Present a synthesized summary:
   - Intents with all behaviours implemented and tested
   - Behaviours that are specified but have no implementations
   - Implementations missing tests
   - Stale specs that may need review
   - Orphaned code with no traceability
5. Suggest next actions: "3 behaviours under 'onboarding' have no implementations — want to start with `/taproot:implement`?"

**Input:** Optional path to scope the report to a subtree.

**Output:** Narrative summary with actionable suggestions.

### 6.9 `/taproot:refine` — Update Specs from Implementation Learnings

**Trigger:** During or after implementation, user discovers that a behaviour spec was incomplete, incorrect, or needs updating.

**Behaviour:**
1. Read the target `usecase.md` and its related `impl.md` records
2. Ask the user what changed or was discovered
3. Update the `usecase.md`: add alternate flows, error conditions, revised postconditions
4. Run `taproot sync-check` to identify other behaviours that might be affected by the change
5. If the change is significant enough to affect the parent intent (e.g., a goal is no longer achievable as specified), flag it and suggest running `/taproot:promote`
6. Run `taproot validate-format`

**Input:** Path to behaviour + description of what changed.

**Output:** Updated `usecase.md`, with suggestions for cascade effects.

### 6.10 `/taproot:promote` — Escalate Findings Up the Hierarchy

**Trigger:** Implementation reveals that a higher-level assumption is wrong — the intent itself needs revision.

**Behaviour:**
1. Read the current implementation context and the full chain up to the intent
2. Summarize what was discovered and why it affects the intent
3. Update the intent's Status to include a review flag
4. Add a note to `intent.md` documenting the finding
5. List all behaviours under the affected intent and flag which ones might need re-evaluation
6. This does NOT auto-modify other behaviours — it creates a review task

**Input:** Path to implementation or behaviour + description of the finding.

**Output:** Updated `intent.md` with review flag, summary of affected behaviours.

### 6.11 `/taproot:decompose` — Break Down an Intent into Behaviours

**Trigger:** User has a new or existing intent and wants help identifying the behaviours needed to fulfill it.

**Behaviour:**
1. Read the target `intent.md`
2. Read any existing behaviours already under it
3. Propose a set of behaviours (UseCases) that would satisfy the intent's success criteria
4. For each proposed behaviour, provide a one-line summary and suggested slug
5. After user selects which ones to create, run `/taproot:behaviour` for each

**Input:** Path to an intent folder.

**Output:** List of proposed behaviours, then created `usecase.md` files for approved ones.

---

## 7. Workflows

Composite sequences of skills and scripts for common development scenarios.

### 7.1 Greenfield / Exploration (Brainstorm → Build)

```
/taproot:brainstorm "We're losing users during onboarding — too many steps, too much friction"
  → explores the problem space: who drops off, where, why
  → surfaces candidate intents:
    1. Simplify registration (reduce form fields)
    2. Add social login (OAuth)
    3. Progressive profiling (collect info over time, not upfront)
  → saves to taproot/_brainstorms/onboarding-friction.md

/taproot:grill taproot/_brainstorms/onboarding-friction.md
  → challenges: "Are these three intents or one intent with three behaviours?"
  → "What data do you have on where users actually drop off?"
  → "Progressive profiling has GDPR implications — is that a constraint?"
  → user refines thinking based on challenges

/taproot:intent "Reduce onboarding drop-off by simplifying first-time registration"
  → creates taproot/simplify-registration/intent.md (informed by brainstorm)

/taproot:decompose taproot/simplify-registration/
  → proposes behaviours, user approves
```

### 7.2 New Feature (Top-Down)

```
/taproot:intent "Users need to reset their password without contacting support"
  → creates taproot/password-reset/intent.md

/taproot:grill taproot/password-reset/intent.md
  → "What about users who no longer have access to their email?"
  → "Is there a security team stakeholder missing?"
  → user updates intent based on findings

/taproot:decompose taproot/password-reset/
  → proposes: request-reset, verify-identity, set-new-password
  → user approves all three
  → creates usecase.md files for each

/taproot:grill taproot/password-reset/request-reset/usecase.md
  → "No rate limiting in the main flow — spam risk"
  → "What happens if the email doesn't exist? Information disclosure?"
  → user refines usecase before implementation

/taproot:implement taproot/password-reset/request-reset/
  → reads usecase.md, writes code + tests + impl.md
  → commits with taproot(password-reset/request-reset/email-trigger): ...

taproot coverage --path taproot/password-reset/
  → shows 1/3 behaviours implemented
```

### 7.3 Bug Fix (Bottom-Up)

```
/taproot:trace src/auth/password-reset.ts
  → shows: impl.md → request-reset (behaviour) → password-reset (intent)
  → user sees the expected behaviour in the UseCase

/taproot:refine taproot/password-reset/request-reset/
  → "The UseCase doesn't account for rate limiting — users can spam reset emails"
  → adds alternate flow for rate limiting to usecase.md

/taproot:implement taproot/password-reset/request-reset/
  → updates implementation to include rate limiting
  → adds test for rate limit scenario
```

### 7.4 Audit / Health Check

```
/taproot:status
  → runs coverage, orphan, and sync checks
  → "12 intents, 34 behaviours, 45 implementations"
  → "3 behaviours have no implementations"
  → "7 implementations have no tests"
  → "2 specs appear stale (code changed after last spec update)"
  → suggests: "Start with /taproot:refine on the stale specs?"

/taproot:grill-all taproot/
  → comprehensive review across all artifacts
  → "Intent 'user-onboarding' has a success criterion no behaviour addresses"
  → "Behaviours 'register-account' and 'verify-email' have contradictory postconditions"
  → "3 implementations have tests that test implementation details, not behaviour"
```

### 7.5 Onboarding / Reverse-Engineer Existing Code

```
/taproot:trace --unlinked
  → scans codebase for source files not referenced by any impl.md
  → groups them by directory/module
  → suggests behaviours that likely correspond to each group

/taproot:intent "Capture existing user authentication logic"
/taproot:behaviour taproot/user-auth/login-flow/
  → AI reads existing code and proposes a UseCase that describes current behaviour
  → user reviews and adjusts

/taproot:implement taproot/user-auth/login-flow/
  → links existing code files and commits to the new impl.md (no new code generated)
```

---

## 8. Configuration (`.taproot.yaml`)

```yaml
# Taproot configuration
version: 1

# Root directory for the requirement hierarchy
root: taproot/

# Commit message format for linking
commit_pattern: "taproot\\(([^)]+)\\):"
commit_trailer: "Taproot"

# Agent adapters to generate (used by `taproot init --agent`)
agents: [claude, cursor, generic]

# Validation strictness
validation:
  require_dates: true
  require_status: true
  allowed_intent_states: [draft, active, achieved, deprecated]
  allowed_behaviour_states: [proposed, specified, implemented, tested, deprecated]
  allowed_impl_states: [planned, in-progress, complete, needs-rework]

# Git hooks
hooks:
  pre_commit:
    - taproot validate-structure
    - taproot validate-format

# CI integration
ci:
  on_pr:
    - taproot validate-structure
    - taproot validate-format
    - taproot check-orphans
    - taproot sync-check
  on_merge:
    - taproot link-commits
    - taproot coverage --format markdown >> pr-comment
    - taproot coverage --format context  # Updates taproot/CONTEXT.md
```

---

## 9. Implementation Plan

### Phase 1: Foundation

Build the hierarchy and validation scripts.

1. `taproot init` — project initialization
2. `taproot validate-structure` — folder nesting rules
3. `taproot validate-format` — document schema validation
4. Document format templates (intent.md, usecase.md, impl.md)

**Language:** Single Node.js CLI package (aligns with Claude Code ecosystem). Installable via npm. All commands are subcommands of the `taproot` binary.

**Acceptance criteria:**
- Running `taproot init` in an empty project creates a valid `taproot/` root and `.taproot.yaml`
- Running `taproot validate-structure` on a correct hierarchy exits 0
- Running `taproot validate-structure` on a broken hierarchy exits 1 with clear error messages
- Running `taproot validate-format` detects missing required sections
- `--fix` flag adds missing section headers with placeholder content

### Phase 2: Linking and Reporting

Build the traceability and visibility layer.

1. `taproot link-commits` — git integration
2. `taproot check-orphans` — disconnected node detection
3. `taproot coverage` — completeness summary
4. `taproot sync-check` — staleness detection

**Acceptance criteria:**
- Commits with `taproot(<path>):` tags are automatically linked to impl.md
- Orphan report correctly identifies implementations referencing deleted files
- Coverage report accurately reflects the tree state in tree, JSON, and markdown formats
- Sync check detects when source files changed after their impl.md

### Phase 3: AI Skills (Canonical Definitions)

Build the portable skill definitions in `taproot/skills/`.

**Pre-development skills:**
1. `/taproot:brainstorm` — explore and expand ideas
2. `/taproot:grill` — stress-test any artifact
3. `/taproot:grill-all` — sweep an entire subtree

**Hierarchy management skills:**
4. `/taproot:intent` — create/refine intents
5. `/taproot:behaviour` — define UseCases
6. `/taproot:implement` — code with traceability
7. `/taproot:trace` — navigate the hierarchy
8. `/taproot:status` — coverage dashboard
9. `/taproot:refine` — update specs from learnings
10. `/taproot:promote` — escalate findings
11. `/taproot:decompose` — break down intents

**Each skill is a self-contained markdown file** in `taproot/skills/` following the canonical skill format (see section 3). Skills invoke the `taproot` CLI for validation after making changes.

**Acceptance criteria:**
- Each skill markdown file is parseable by any AI agent that reads structured instructions
- Skills correctly read and write to the `taproot/` hierarchy
- Skills run validation after making changes
- `/taproot:trace` correctly navigates both top-down and bottom-up
- `/taproot:implement` creates commits with the `taproot(<path>):` tag format
- `/taproot:grill` produces structured, actionable critiques at all three hierarchy levels
- `/taproot:brainstorm` outputs candidate intents without creating hierarchy entries

### Phase 4: Agent Adapters

Build the thin adapter layer for each supported agent.

1. `taproot init --agent claude` — generates `.claude/skills/taproot/` with slash commands
2. `taproot init --agent cursor` — generates `.cursor/rules/taproot.md`
3. `taproot init --agent copilot` — generates `.github/copilot-instructions.md` section
4. `taproot init --agent windsurf` — generates `.windsurfrules` entries
5. `taproot init --agent generic` — generates `AGENTS.md` for any agent
6. `taproot init --agent all` — generates all adapters
7. Adapter regeneration when skill definitions change

**Acceptance criteria:**
- Each adapter correctly maps all skills to the agent's native extension mechanism
- Adapters are generated from canonical skill definitions, not hand-written
- `taproot init --agent all` produces working configurations for all supported agents
- An agent with no dedicated adapter can still operate Taproot via the generic `AGENTS.md`

### Phase 5: Integration

1. Pre-commit hook configuration via `taproot init --with-hooks`
2. CI pipeline integration via `taproot init --with-ci github|gitlab`
3. PR comment generation (`taproot coverage --format markdown`)
4. `taproot coverage --format context` generates `taproot/CONTEXT.md` for agent consumption
5. README and onboarding guide
6. `taproot/CONVENTIONS.md` auto-generated reference for document formats and commit conventions

---

## 10. Open Questions

- **Scale:** How does the hierarchy perform with hundreds of intents? Should there be a top-level grouping (e.g., by domain or epic)?
- **Cross-cutting concerns:** A behaviour like "audit logging" serves many intents. Should we support symlinks or references, or duplicate the behaviour under each intent?
- **Migration path:** For existing projects, should `/taproot:trace --unlinked` be the primary onboarding tool, or should there be a bulk import skill?
- **Versioning:** When a behaviour changes significantly, should the old version be preserved (e.g., `usecase.v1.md`) or should git history be sufficient?
- **Visualization:** Should there be an HTML dashboard that renders the hierarchy as an interactive tree? Or is the CLI coverage report sufficient?
- **Multi-repo:** For projects spanning multiple repositories, should `impl.md` support cross-repo commit references?

