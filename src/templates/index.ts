export function intentTemplate(date: string): string {
  return `# Intent: <Title>

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
- **Created:** ${date}
- **Last reviewed:** ${date}

## Notes
<Free-form context, links to external docs, meeting notes, etc.>
`;
}

export function behaviourTemplate(date: string): string {
  return `# Behaviour: <Title>

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
- **Created:** ${date}
- **Last reviewed:** ${date}

## Notes
<Edge cases, open questions, links to related behaviours>
`;
}

export function implTemplate(date: string, behaviourRef: string = '../usecase.md'): string {
  return `# Implementation: <Title>

## Behaviour
${behaviourRef}

## Design Decisions
- <Decision 1: what was chosen and why>

## Source Files
- \`<path/to/file.ts>\` — <brief description of what this file does for this implementation>

## Commits
- \`<hash>\` — <one-line summary>

## Tests
- \`<path/to/test-file.test.ts>\` — <what scenarios this test covers>

## Status
- **State:** planned
- **Created:** ${date}
- **Last verified:** ${date}

## Notes
<Technical debt, known limitations, future improvements>
`;
}

export const SECTION_PLACEHOLDERS: Record<string, Record<string, string>> = {
  intent: {
    'stakeholders': '- <Role>: <Name or team> — <their interest in this intent>',
    'goal': '<1-3 sentences describing the desired outcome from the stakeholder\'s perspective>',
    'success criteria': '- [ ] <Measurable criterion 1>',
    'constraints': '- <Constraint 1>',
    'status': '- **State:** draft\n- **Created:** <YYYY-MM-DD>\n- **Last reviewed:** <YYYY-MM-DD>',
    'notes': '<Free-form context>',
  },
  behaviour: {
    'actor': '<Who or what initiates this behaviour>',
    'preconditions': '- <What must be true before this behaviour can occur>',
    'main flow': '1. <Step 1>\n2. <Step 2>',
    'alternate flows': '### <Alternate flow name>\n- **Trigger:** <When?>\n- **Steps:**\n  1. <Step>',
    'postconditions': '- <What is true after successful completion>',
    'error conditions': '- <Error scenario>: <Expected system response>',
    'status': '- **State:** proposed\n- **Created:** <YYYY-MM-DD>\n- **Last reviewed:** <YYYY-MM-DD>',
    'notes': '<Edge cases, open questions>',
  },
  impl: {
    'behaviour': '../usecase.md',
    'design decisions': '- <Decision 1: what was chosen and why>',
    'source files': '- `<path/to/file.ts>` — <description>',
    'commits': '- `<hash>` — <one-line summary>',
    'tests': '- `<path/to/test.ts>` — <what this covers>',
    'status': '- **State:** planned\n- **Created:** <YYYY-MM-DD>\n- **Last verified:** <YYYY-MM-DD>',
    'notes': '<Technical debt, known limitations>',
  },
};
