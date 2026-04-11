# Behaviour: Activate UX Module

## Actor
Developer (team lead or contributor) setting up UX quality guidance for a project

## Preconditions
- Taproot is initialized in the project
- Developer has access to the codebase and its existing specs

## Main Flow
1. Developer invokes the user-experience module skill.
2. System checks whether a project context record exists; if absent, system runs context discovery — asking the developer about the product type, target audience, and quality goals — before proceeding.
3. System scans existing specs, code, and global truths and reports which of the 9 UX aspects already have partial coverage.
4. System presents the 9 aspects — orientation, flow, feedback, input, presentation, language, accessibility, adaptation, consistency — marking any with existing coverage.
5. Developer selects which aspects to define in this session (all or a subset).
6. For each selected aspect, system asks targeted questions, uses the established project context to propose archetype-appropriate defaults, and surfaces discovered patterns from the codebase; developer reviews and confirms the elicited conventions.
7. System writes a scoped global truth file for each completed aspect (e.g., `ux-orientation_behaviour.md`) containing conventions and an agent checklist.
8. System asks whether to wire `check-if-affected-by: taproot-modules/user-experience` as a DoD condition in project configuration.
9. Developer confirms or declines.
10. System writes the condition to project configuration (if confirmed) and presents a summary of truths written and aspects remaining.

## Alternate Flows

### Aspect already defined
- **Trigger:** A global truth file for the aspect already exists.
- **Steps:**
  1. System displays the existing conventions and checklist for the aspect.
  2. System offers: extend with new conventions, replace, or skip.
  3. Developer chooses; system proceeds accordingly.

### Partial session
- **Trigger:** Developer selects Done before all selected aspects are completed.
- **Steps:**
  1. System writes global truth files for all completed aspects.
  2. System records remaining aspects as not yet defined.
  3. System notes the module can be re-invoked to continue with uncovered aspects.

### DoD wiring declined
- **Trigger:** Developer declines the DoD wiring offer in step 8.
- **Steps:**
  1. System skips writing the DoD condition.
  2. System includes the condition text in the summary so developer can add it manually.

### Activated without project context
- **Trigger:** Developer skips or declines context discovery when prompted in step 2.
- **Steps:**
  1. System proceeds using generic defaults for sub-skill questions.
  2. No project context record is written.
  3. System notes that context can be established at any future session by re-invoking the skill.

## Postconditions
- A scoped global truth file exists for each completed aspect, containing conventions and a checklist for agents to apply at DoR/DoD time
- DoD condition is wired in project configuration (if developer confirmed in step 9)
- If context discovery ran, the project context record is available for other quality modules to use in subsequent sessions

## Error Conditions
- **Taproot not initialized**: System stops with a message directing the developer to run `taproot init` before activating any module.
- **Project configuration not writable**: System presents the DoD condition text and target file path so the developer can add it manually.

## Flow

```mermaid
flowchart TD
    A([Developer invokes UX module skill]) --> B{Project context\nrecord exists?}
    B -- No --> C[Run context discovery\nproduct type · audience · quality goals]
    C --> D[Scan existing specs and truths]
    B -- Yes --> D
    B -- Skipped --> D
    D --> E[Present 9 UX aspects with coverage status]
    E --> F{Developer selects aspects}
    F --> G[For each aspect: propose context-informed defaults\nelicit conventions + discover patterns]
    G --> H{Truth file already exists?}
    H -- yes --> I[Show existing conventions\nOffer: extend / replace / skip]
    I --> J[Write or update global truth file]
    H -- no --> K[Elicit via targeted questions]
    K --> J
    J --> L{More aspects selected?}
    L -- yes --> G
    L -- no, or Developer done --> M[Offer DoD wiring]
    M -- confirmed --> N[Write check-if-affected-by to project configuration]
    M -- declined --> O[Include condition text in summary]
    N --> P([Summary: truths written, aspects remaining])
    O --> P
```

## Behaviours <!-- taproot-managed -->
- [Define Orientation Conventions](./orientation/usecase.md)
- [Define Flow Conventions](./flow/usecase.md)
- [Define Feedback Conventions](./feedback/usecase.md)
- [Define Input Conventions](./input/usecase.md)
- [Define Presentation Conventions](./presentation/usecase.md)
- [Define Language Conventions](./language/usecase.md)
- [Define Accessibility Conventions](./accessibility/usecase.md)
- [Define Adaptation Conventions](./adaptation/usecase.md)
- [Define Consistency Conventions](./consistency/usecase.md)

## Related
- `taproot-modules/intent.md` — parent intent: optional module system goal and constraints
- `module-context-discovery/usecase.md` — runs as a prerequisite step; produces the project context record this behaviour consumes

## Implementations <!-- taproot-managed -->
- [Agent Skill — UX Module](./agent-skill/impl.md)

## Acceptance Criteria

**AC-1: Full session — all aspects defined and DoD wired**
- Given a taproot-initialized project with no existing UX truths
- When developer invokes the UX module skill and works through all 9 aspects
- Then 9 global truth files are written and the DoD condition is added to project configuration

**AC-2: Aspect already defined — extend or skip offered**
- Given a project where a UX truth file already exists for one or more aspects
- When developer invokes the skill and reaches an already-defined aspect
- Then system shows existing conventions and offers to extend, replace, or skip

**AC-3: Partial session — developer stops early**
- Given a session in progress with some aspects completed
- When developer selects Done before all aspects are covered
- Then truths are written for completed aspects and remaining aspects are noted as uncovered

**AC-4: DoD wiring declined**
- Given a session where at least one aspect is defined
- When developer declines the DoD wiring offer
- Then no DoD condition is written and the condition text appears in the session summary

**AC-5: Taproot not initialized**
- Given a directory without taproot initialization
- When developer invokes the UX module skill
- Then system stops with a message to initialize taproot first

**AC-6: Context discovery runs before aspect selection on first invocation**
- Given no project context record exists
- When Developer invokes the UX module skill
- Then system runs context discovery before presenting the 9 UX aspects

## Status
- **State:** implemented
- **Created:** 2026-04-11
- **Last reviewed:** 2026-04-11
