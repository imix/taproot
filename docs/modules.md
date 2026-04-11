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

## User-experience module (`/tr-ux-define`)

The user-experience module captures UX conventions across 9 aspects and wires agent checklists so implementations stay consistent.

### Activation

```
/tr-ux-define
```

The orchestrator scans for existing coverage, presents the 9 aspects with their status, and walks through each in sequence. At the end it offers to wire `check-if-affected-by: taproot-modules/user-experience` as a DoD condition.

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

## Planned modules

The module architecture is designed to extend to other quality domains:

| Module | Domain |
|--------|--------|
| `security` | Input validation, auth boundaries, secret handling, threat-modelling checklist |
| `architecture` | Decision records, layer boundaries, dependency rules, coupling checklist |
| `testing` | Coverage targets, test naming, fixture patterns, flakiness prevention |
| `code-maintenance` | Deprecation policy, dead-code removal, dependency hygiene |
| `release` | Versioning convention, changelog format, release checklist |

Each new module follows the same pattern: one orchestrator skill + sub-skills per domain aspect + scoped global truth files + optional DoD condition. See the **Quality module** pattern in `docs/patterns.md`.
