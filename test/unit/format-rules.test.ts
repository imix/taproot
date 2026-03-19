import { describe, it, expect } from 'vitest';
import {
  checkRequiredSections,
  checkStatusValue,
  checkDateFormat,
} from '../../src/validators/format-rules.js';
import { parseMarkdown } from '../../src/core/markdown-parser.js';
import { DEFAULT_CONFIG } from '../../src/core/config.js';

function parse(content: string) {
  return parseMarkdown('test.md', content);
}

const intentDoc = (extra = '') => parse(`
# Intent: Test

## Stakeholders
- Product: team

## Goal
some goal

## Success Criteria
- [ ] criterion

## Status
- **State:** active
- **Created:** 2024-01-15
- **Last reviewed:** 2024-03-01

## Notes
none
${extra}
`.trim());

describe('checkRequiredSections', () => {
  it('passes a complete intent document', () => {
    expect(checkRequiredSections(intentDoc(), 'intent')).toHaveLength(0);
  });

  it('reports missing sections', () => {
    const doc = parse(`## Goal\nsome goal\n## Status\n- **State:** draft\n`);
    const v = checkRequiredSections(doc, 'intent');
    const codes = v.map(x => x.code);
    expect(codes).toContain('MISSING_SECTION');
    // Should report stakeholders and success criteria missing
    expect(v.some(x => x.message.includes('Stakeholders'))).toBe(true);
    expect(v.some(x => x.message.includes('Success Criteria'))).toBe(true);
  });

  it('passes a complete behaviour document', () => {
    const doc = parse(`
## Actor
user

## Preconditions
- logged in

## Main Flow
1. step

## Postconditions
- done

## Status
- **State:** proposed
    `.trim());
    expect(checkRequiredSections(doc, 'behaviour')).toHaveLength(0);
  });

  it('passes a complete impl document', () => {
    const doc = parse(`
## Behaviour
../usecase.md

## Commits
- \`abc\` — thing

## Tests
- \`test.ts\` — covers it

## Status
- **State:** complete
    `.trim());
    expect(checkRequiredSections(doc, 'impl')).toHaveLength(0);
  });
});

describe('checkStatusValue', () => {
  it('passes valid intent status', () => {
    expect(checkStatusValue(intentDoc(), 'intent', DEFAULT_CONFIG)).toHaveLength(0);
  });

  it('fails invalid intent status', () => {
    const doc = parse(`
## Stakeholders
- t: t

## Goal
g

## Success Criteria
- [ ] c

## Status
- **State:** in-progress
    `.trim());
    const v = checkStatusValue(doc, 'intent', DEFAULT_CONFIG);
    expect(v[0]?.code).toBe('INVALID_STATUS_VALUE');
    expect(v[0]?.message).toContain('in-progress');
  });

  it('reports MISSING_STATE_LINE when State line absent', () => {
    const doc = parse(`## Status\n- **Created:** 2024-01-01\n`);
    const v = checkStatusValue(doc, 'intent', DEFAULT_CONFIG);
    expect(v[0]?.code).toBe('MISSING_STATE_LINE');
  });

  it('returns nothing when status section missing (caught by checkRequiredSections)', () => {
    const doc = parse(`## Goal\nsome goal\n`);
    expect(checkStatusValue(doc, 'intent', DEFAULT_CONFIG)).toHaveLength(0);
  });
});

describe('checkDateFormat', () => {
  it('passes valid ISO dates', () => {
    expect(checkDateFormat(intentDoc(), DEFAULT_CONFIG)).toHaveLength(0);
  });

  it('fails non-ISO dates', () => {
    const doc = parse(`
## Status
- **State:** active
- **Created:** Jan 15 2024
- **Last reviewed:** 2024-03-01
    `.trim());
    const v = checkDateFormat(doc, DEFAULT_CONFIG);
    expect(v[0]?.code).toBe('INVALID_DATE_FORMAT');
    expect(v[0]?.message).toContain('Jan 15 2024');
  });

  it('returns nothing when requireDates is false', () => {
    const config = { ...DEFAULT_CONFIG, validation: { ...DEFAULT_CONFIG.validation, requireDates: false } };
    const doc = parse(`## Status\n- **State:** draft\n- **Created:** not-a-date\n`);
    expect(checkDateFormat(doc, config)).toHaveLength(0);
  });
});
