# Taproot Conventions

Auto-generated reference for document formats and commit conventions.

## Document Formats

### intent.md — Business Intent

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
- **State:** draft
- **Created:** 2026-03-19
- **Last reviewed:** 2026-03-19

## Notes
<Free-form context, links to external docs, meeting notes, etc.>
```

### usecase.md — Behaviour (UseCase)

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
- **State:** proposed
- **Created:** 2026-03-19
- **Last reviewed:** 2026-03-19

## Notes
<Edge cases, open questions, links to related behaviours>
```

### impl.md — Implementation

```markdown
# Implementation: <Title>

## Behaviour
../usecase.md

## Design Decisions
- <Decision 1: what was chosen and why>

## Source Files
- `<path/to/file.ts>` — <brief description of what this file does for this implementation>

## Commits
- `<hash>` — <one-line summary>

## Tests
- `<path/to/test-file.test.ts>` — <what scenarios this test covers>

## Status
- **State:** planned
- **Created:** 2026-03-19
- **Last verified:** 2026-03-19

## Notes
<Technical debt, known limitations, future improvements>
```

## Folder Naming

- Lowercase kebab-case: `^[a-z0-9]+(-[a-z0-9]+)*$`
- Each folder is exactly one type (intent, behaviour, or implementation)
- Identified by its marker file: `intent.md`, `usecase.md`, or `impl.md`

## Commit Convention

Link commits to implementations using the conventional tag format:

```
taproot(<intent>/<behaviour>/<impl>): <message>
```

Or use a commit trailer:

```
Taproot: <intent>/<behaviour>/<impl>
```

## Folder Structure

```
taproot/
├── <intent-slug>/
│   ├── intent.md
│   └── <behaviour-slug>/
│       ├── usecase.md
│       └── <implementation-slug>/
│           └── impl.md
```
