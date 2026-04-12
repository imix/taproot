# Skill: arch-style

## Description

Elicit and capture the project's architectural style: ask whether the team follows a named style (clean architecture, hexagonal, microservices, self-contained systems, etc.), propose canonical rules for review or accept developer-provided rules, and write `arch-style_behaviour.md` to `taproot/global-truths/`. Invoked by `arch-define` Phase 0b; can also be run standalone to update the declared style.

## Inputs

- None required.

## Steps

1. Scan `taproot/global-truths/` for an existing `arch-style_behaviour.md`. If found, read it and present:

   > **Architectural style already defined**
   >
   > Style: [value]
   >
   > **[A]** Extend — add rules   **[B]** Replace — overwrite   **[L]** Skip — keep as-is

   On **[L]**: stop. Return to orchestrator if invoked from arch-define.

2. Read `taproot/global-truths/project-context_intent.md` if it exists. Note the declared stack for use in step 3b.

3. Ask:

   > **Architectural style**
   >
   > Does this project follow a preferred architectural style?
   > (e.g. clean architecture, hexagonal, microservices, self-contained systems — or name your own)
   >
   > **[S]** Skip — no declared style

   On **[S]**: note "Architectural style step skipped — aspects will use generic defaults." Stop. Return to orchestrator if invoked from arch-define.

4. Developer names a style. Ask how to populate the conventions:

   > **[A]** I have a ruleset — I'll provide the rules directly
   > **[B]** Propose canonical rules for me to review and trim

5. On **[A]**: Developer provides the rules (as a bullet list or free-form text). Collect them, then proceed to step 7.

6. On **[B]**: Check whether the named style is in the known-styles list below.

   **Known styles and their canonical rules:**

   **Clean Architecture** `[High confidence]`
   - Core: Dependency rule — all source code dependencies point inward; outer layers depend on inner layers, never vice versa; Entities contain enterprise business rules and have no outward dependencies; Use cases contain application business logic and depend only on entities; Interface adapters translate between use cases and external systems; Frameworks, databases, and UI are in the outermost layer and are treated as plugins
   - Extended: Each inner layer is independently testable without any outer layer present; The domain model uses plain objects — not ORM models or framework types; Database and UI are swappable without changing inner layer code

   **Hexagonal Architecture (Ports and Adapters)** `[High confidence]`
   - Core: Domain logic lives at the centre and has no knowledge of any adapter; Ports are interfaces that define how the application communicates with the outside world; Adapters implement ports for specific technologies (HTTP, database, message queue, CLI); Adapters depend on ports — ports never depend on adapters; The domain must be fully testable with no adapter present
   - Extended: Primary (driving) adapters initiate interaction (e.g. HTTP controllers, CLI handlers); Secondary (driven) adapters respond to domain requests (e.g. repositories, email senders); Each port should have at least one test adapter for unit testing

   **Microservices** `[High confidence]`
   - Core: Each service owns its data — services do not share a database; Services communicate only via well-defined interfaces (HTTP API, events, gRPC — no direct calls to another service's data layer); Each service can be deployed, scaled, and failed independently; No shared libraries containing business logic — shared libraries for infrastructure utilities only
   - Extended: Service boundaries align with business capabilities, not technical layers; Failure in one service must not cascade to others (circuit breakers, timeouts, fallbacks); Each service has its own deployment pipeline

   **Self-Contained Systems (SCS)** `[High confidence]`
   - Core: Each system includes its own UI, business logic, and data storage; No shared database between systems; Each system is independently deployable; Asynchronous communication preferred — synchronous only where deferral is not possible
   - Extended: Systems communicate via links and events, not shared domain models; A system's API is a last resort, not the default integration point

   **Go idiomatic** `[High confidence]`
   - Core: Small, clearly-named packages — one package per domain concept; No mandatory service/repository layering unless genuine complexity demands it; Interfaces defined at the point of use, not centrally in a shared types package; Dependencies passed as constructor arguments — no global state or DI framework
   - Extended: Prefer flat package structures over deep hierarchies; Error values returned and checked explicitly — no exception-style control flow

   **Rails / MVC (convention-over-configuration)** `[High confidence]`
   - Core: Models, Views, Controllers follow Rails conventions — no custom layer names; Business logic in models (or service objects for complex cases); Controllers are thin — orchestrate, do not contain business logic; ActiveRecord is the domain model — do not abstract it away behind a repository layer
   - Extended: Fat models are acceptable for project-specific logic; service objects for workflows that span multiple models

   If the style is not in the known list, or if confidence is low for the declared stack + style combination:

   > "I don't have strong knowledge of [style] conventions for this stack — I'd suggest deriving your conventions through questions rather than starting from a preset."
   >
   > **[A]** Yes — ask me questions   **[B]** I'll provide the rules directly

   On **[A]**: ask targeted questions:
   - Where does business/domain logic live — which layer or module?
   - Where does data access (database queries, API calls) live — is it separated from business logic?
   - How are entry points (HTTP handlers, CLI commands, event listeners) separated from application logic?
   - What cross-layer dependencies are explicitly forbidden?
   - How are external systems (database, email, third-party API) abstracted?

   Collect answers. Derive conventions. Proceed to draft step with style name "Custom" (or a developer-provided label).

   On **[B]**: developer provides rules directly. Proceed to step 7.

   For **known styles**, present the core and extended rules grouped:

   > **[Style name]** — core rules and extended rules
   >
   > **Core rules** (define the style — confirm all or edit individual rules):
   > 1. [rule]
   > 2. [rule]
   > ...
   >
   > **Extended rules** (optional — select any that apply):
   > - [rule]
   > - [rule]
   >
   > Review, optionally edit any rule, then:
   > **[A]** Confirm core + selected extended   **[E]** Edit a rule before confirming

   On **[E]**: developer provides the edited rule text; re-present updated rules with [A]/[E].

7. Draft the `arch-style_behaviour.md` content.

   For named styles (clean, hexagonal, etc.):

   ```markdown
   ## Architectural style

   ### Style
   [Name]

   ### Core rules
   - [rule]
   - [rule]

   ### Extended rules
   - [rule] (only if selected; omit section if none selected)

   ## Agent checklist

   Before implementing any module, class, or function:
   - [ ] Does this implementation follow the declared architectural style and avoid violating any of its confirmed core rules?
   ```

   For custom/question-led:

   ```markdown
   ## Architectural style

   ### Style
   Custom: [developer-provided label or "Custom"]

   ### Conventions
   - [convention]
   - [convention]

   ## Agent checklist

   Before implementing any module, class, or function:
   - [ ] Does this implementation follow the declared architectural style and avoid violating any of its confirmed core rules?
   ```

8. If `arch-style_behaviour.md` already exists (extend path from step 1):

   > **[artifact-review]** Updated conventions ready.
   > **[A]** Write (extend)   **[C]** Cancel

   If no existing file:

   > **[artifact-review]** Draft conventions ready.
   > **[A]** Write `arch-style_behaviour.md`   **[C]** Cancel

9. On **[A]**: write `taproot/global-truths/arch-style_behaviour.md`. Report: "✓ Written: `taproot/global-truths/arch-style_behaviour.md`"

   Note: subsequent arch-define aspects (especially `arch-module-boundaries`) will read this file at their scan step and use the declared style to propose style-appropriate defaults.

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

> **What's next?**
> [1] `/tr-arch-module-boundaries` — define module boundary conventions (uses declared style as context)
> [2] `/tr-arch-define` — return to module orchestrator
> [3] `/tr-commit` — commit the new truth file

## Output

`taproot/global-truths/arch-style_behaviour.md` — declared architectural style with confirmed core rules, selected extended rules, and agent checklist.

## CLI Dependencies

None.

## Notes

- If invoked from `/tr-arch-define`, skip the What's next block and return control to the orchestrator.
- The known-styles list covers the most common architectural patterns. For unlisted styles, question-led elicitation produces an equivalent `arch-style_behaviour.md` without canonical rules.
- Stack confidence signals (`[High confidence]` / `[Low confidence]`) appear only in the oral suggestion step — they are not written to the truth file.
