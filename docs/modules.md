# Quality Modules

Quality modules are optional, installable skill packages that give agents the conventions, checklists, and pattern vocabulary needed to produce consistent, domain-appropriate implementations.

A project without modules activated is not affected. A project that activates a module gains automatically-applied conventions during implementation — without any changes to the core taproot workflow.

---

## How modules work

Each module consists of:
- **An orchestrator skill** — the entry point that scans coverage, routes to sub-skills, and optionally wires a DoD condition
- **Sub-skills** — one per domain aspect, each eliciting conventions through targeted questions and writing a scoped global truth file
- **Global truth files** — written to `taproot/global-truths/` with conventions and an agent checklist; enforced at commit time by the truth-check hook
- **An optional DoD condition** — `check-if-affected-by: taproot-modules/<module>` wired into `taproot/settings.yaml` so agents check compliance at every implementation commit

**Module skills are opt-in.** Declare which modules your project uses in `taproot/settings.yaml` under the `modules:` key, then run `taproot update` or `taproot init` to install their skill files. Only declared module skills are installed — undeclared module skills are never present in the project.

```yaml
# taproot/settings.yaml
modules:
  - user-experience
```

Skills for undeclared modules are not installed (and are removed if previously present). No DoD conditions run unless the project explicitly wires them.

---

## Project context (`/tr-module-context-discovery`)

Before the first module session, modules benefit from a shared project context record — the product type, target audience, and quality goals of the project. This lets module sub-skills propose archetype-appropriate defaults rather than asking open-ended questions.

```
/tr-module-context-discovery
```

The skill asks three questions (product type → audience → quality goals), each with a `[?] Get help` option where the agent scans existing specs and applies domain knowledge to propose an answer. The confirmed answers are written to `taproot/global-truths/project-context_intent.md`.

You can run this standalone before starting any module session, or let any module orchestrator run it automatically when it finds no record. Re-run at any time to update or reset the record.

---

## User-experience module (`/tr-ux-define`)

The user-experience module captures UX conventions across 10 aspects and wires agent checklists so implementations stay consistent.

### Activation

```
/tr-ux-define
```

The orchestrator scans for existing coverage, presents the 10 aspects with their status, and walks through each in sequence. At the end it offers to wire `check-if-affected-by: taproot-modules/user-experience` as a DoD condition.

### Aspects and sub-skills

| Aspect | Skill | What it captures |
|--------|-------|-----------------|
| Orientation | `/tr-ux-orientation` | Context indicators, empty states, onboarding, help placement |
| Flow | `/tr-ux-flow` | Navigation model, multi-step tasks, cancellation, destructive-action confirmation |
| Feedback | `/tr-ux-feedback` | Success/error/warning hierarchy, loading states, partial outcomes |
| Input | `/tr-ux-input` | Validation timing, required/optional signalling, defaults, keyboard affordances |
| Presentation | `/tr-ux-presentation` | Layout structure, hierarchy signals, density, progressive disclosure, collection display |
| Language | `/tr-ux-language` | Copy tone, terminology, locale handling, variable-length text, formatting |
| Accessibility | `/tr-ux-accessibility` | Keyboard model, focus management, contrast targets, motion preferences, labelling, live regions |
| Adaptation | `/tr-ux-adaptation` | Environment targets, layout reflow, dark/high-contrast support, constrained-environment fallbacks |
| Consistency | `/tr-ux-consistency` | Shared-pattern vocabulary, deviation documentation, cross-surface alignment |
| Visual | `/tr-ux-visual` | Colour palette, semantic colour tokens, dark/light mode rules, icon set, iconography style, sizing |

Each sub-skill can be run directly (e.g. `/tr-ux-orientation`) or via the orchestrator. Sub-skills write to `taproot/global-truths/ux-<aspect>_behaviour.md`.

### What gets written

Each completed aspect produces a global truth file in `taproot/global-truths/`. Example:

```
taproot/global-truths/
  ux-orientation_behaviour.md   ← empty-state convention, help placement, ...
  ux-flow_behaviour.md          ← navigation model, cancel behaviour, ...
  ux-feedback_behaviour.md      ← error hierarchy, loading states, ...
  ...
```

Each file contains:
- **Conventions** — the elicited rules, one section per sub-topic
- **Agent checklist** — a `- [ ]` list agents run at DoR/DoD time when the DoD condition is wired

### DoD wiring

When the DoD condition is active in `taproot/settings.yaml`:
```yaml
definitionOfDone:
  - check-if-affected-by: taproot-modules/user-experience
```

…agents read `taproot/specs/taproot-modules/user-experience/usecase.md` at every implementation commit and verify that applicable UX conventions from the truth files are followed. The check is agent-driven — no hard hook enforcement.

---

## Security module (`/tr-security-define`)

The security module captures security conventions across 5 enforcement layers and wires agent checklists so implementations stay secure by default.

Unlike the UX module (which elicits stylistic preferences), the security module installs enforcement mechanisms at multiple levels — what the agent checks when writing code, what tools it runs locally, what the pipeline enforces, and how the deployment is hardened.

### Activation

```
/tr-security-define
```

The orchestrator establishes security context (stack, deployment environment, threat profile), scans for existing coverage, and walks through each layer in sequence. At the end it offers to wire `check-if-affected-by: taproot-modules/security` as a DoD condition.

### Layers and sub-skills

| Layer | Skill | What it captures |
|-------|-------|-----------------|
| Rules | `/tr-security-rules` | Secure coding conventions: input validation, auth, authorisation, secrets, data protection, error handling, logging, injection prevention, dependency hygiene |
| Local tooling | `/tr-security-local-tooling` | SAST, secrets scanning, and dependency audit: tool selection, run triggers, blocking thresholds |
| CI/CD | `/tr-security-ci-cd` | Pipeline security gates: tools, triggers, and fail conditions |
| Hardening | `/tr-security-hardening` | Deploy-time baseline: security headers, TLS requirements, least-privilege, secrets management |
| Periodic review | `/tr-security-periodic-review` | Audit checklist: dependency currency, secret rotation, threat model refresh, custom items |

### Periodic review

The periodic-review layer has two modes:

- **Setup** (run from orchestrator): elicits which audit items apply and their cadence; writes `security-periodic-review_behaviour.md`
- **Run** (invoke directly): executes the review, surfaces findings, and updates last-reviewed dates

```
/tr-security-periodic-review --run
```

### What gets written

Each completed layer produces a global truth file in `taproot/global-truths/`:

```
taproot/global-truths/
  security-rules_behaviour.md           ← secure coding conventions
  security-local-tooling_behaviour.md   ← scanner setup and thresholds
  security-ci-cd_behaviour.md           ← pipeline gate configuration
  security-hardening_behaviour.md       ← deployment hardening baseline
  security-periodic-review_behaviour.md ← audit checklist with cadence
```

Each file contains conventions and an agent checklist agents apply at DoR/DoD time.

### DoD wiring

```yaml
definitionOfDone:
  - check-if-affected-by: taproot-modules/security
```

When wired, agents read `taproot/specs/taproot-modules/security/usecase.md` at every implementation commit and verify applicable security conventions are followed.

---

## Planned modules

The module architecture is designed to extend to other quality domains:

| Module | Domain |
|--------|--------|
| `architecture` | Decision records, layer boundaries, dependency rules, coupling checklist |
| `testing` | Coverage targets, test naming, fixture patterns, flakiness prevention |
| `code-maintenance` | Deprecation policy, dead-code removal, dependency hygiene |
| `release` | Versioning convention, changelog format, release checklist |

Each new module follows the same pattern: one orchestrator skill + sub-skills per domain aspect + scoped global truth files + optional DoD condition. See the **Quality module** pattern in `docs/patterns.md`.
