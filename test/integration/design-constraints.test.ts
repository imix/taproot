import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';

const ROOT = resolve(__dirname, '../..');
// design-constraints was absorbed into define-truth (commit f7d71e8) — structured formats live there now
const SKILL_PATH = join(ROOT, 'skills/define-truth.md');
const INSTALLED_SKILL_PATH = join(ROOT, 'taproot/agent/skills/define-truth.md');
const PATTERNS_PATH = join(ROOT, 'docs/patterns.md');
const BEHAVIOUR_SKILL_PATH = join(ROOT, 'skills/behaviour.md');
const INEED_SKILL_PATH = join(ROOT, 'skills/ineed.md');
const SPEC_PATH = join(ROOT, 'taproot/specs/global-truth-store/author-design-constraints/usecase.md');

describe('design-constraints skill', () => {
  it('structured formats live in skills/define-truth.md (absorbed from design-constraints)', () => {
    expect(existsSync(SKILL_PATH)).toBe(true);
  });

  it('installed copy exists at taproot/agent/skills/define-truth.md', () => {
    expect(existsSync(INSTALLED_SKILL_PATH)).toBe(true);
  });

  it('skill and installed copy are identical', () => {
    const skill = readFileSync(SKILL_PATH, 'utf-8');
    const installed = readFileSync(INSTALLED_SKILL_PATH, 'utf-8');
    expect(skill).toBe(installed);
  });

  it('skill contains all four constraint formats', () => {
    const content = readFileSync(SKILL_PATH, 'utf-8');
    expect(content).toMatch(/\[D\].*Decision/i);
    expect(content).toMatch(/\[P\].*Principle/i);
    expect(content).toMatch(/\[R\].*Rule/i);
    expect(content).toMatch(/\[E\].*External/i);
  });

  it('Decision format includes ADR fields: context, options, decision, consequences', () => {
    const content = readFileSync(SKILL_PATH, 'utf-8');
    expect(content).toMatch(/Context/i);
    expect(content).toMatch(/Options considered/i);
    expect(content).toMatch(/Decision/i);
    expect(content).toMatch(/Consequences/i);
  });

  it('Principle format includes name, rationale, correct example, violation example', () => {
    const content = readFileSync(SKILL_PATH, 'utf-8');
    expect(content).toMatch(/Rationale/i);
    expect(content).toMatch(/Correct/i);
    expect(content).toMatch(/Violation/i);
  });

  it('Rule format includes rule, correct, incorrect, optional rationale and exceptions', () => {
    const content = readFileSync(SKILL_PATH, 'utf-8');
    expect(content).toMatch(/Rule:/i);
    expect(content).toMatch(/Incorrect/i);
    expect(content).toMatch(/Exceptions/i);
  });

  it('External format includes source, constraint, implications, optional expiry', () => {
    const content = readFileSync(SKILL_PATH, 'utf-8');
    expect(content).toMatch(/Source:/i);
    expect(content).toMatch(/Implications/i);
    expect(content).toMatch(/Expiry/i);
  });

  it('skill includes contradiction check before writing', () => {
    const content = readFileSync(SKILL_PATH, 'utf-8');
    expect(content).toMatch(/Contradiction check|contradict/i);
  });

  it('skill includes completeness check at session end', () => {
    const content = readFileSync(SKILL_PATH, 'utf-8');
    expect(content).toMatch(/Completeness check|completeness/i);
  });

  it('skill references itself as a repeat invocation option', () => {
    const content = readFileSync(SKILL_PATH, 'utf-8');
    expect(content).toMatch(/tr-define-truth/);
  });
});

describe('design-constraints pattern discovery', () => {
  it('docs/patterns.md contains design constraints pattern entry', () => {
    const content = readFileSync(PATTERNS_PATH, 'utf-8');
    expect(content).toMatch(/[Dd]esign constraints/);
  });

  it('docs/patterns.md includes all four format descriptions', () => {
    const content = readFileSync(PATTERNS_PATH, 'utf-8');
    expect(content).toMatch(/Decision.*ADR/i);
    expect(content).toMatch(/Principle/i);
    expect(content).toMatch(/Rule.*Convention/i);
    expect(content).toMatch(/External constraint/i);
  });

  it('docs/patterns.md includes signal phrases for architecture and UX', () => {
    const content = readFileSync(PATTERNS_PATH, 'utf-8');
    expect(content).toMatch(/define our architecture|record our tech choices/i);
    expect(content).toMatch(/UX guidelines|design principles/i);
  });

  it('docs/patterns.md links to define-truth spec', () => {
    const content = readFileSync(PATTERNS_PATH, 'utf-8');
    expect(content).toMatch(/define-truth\/usecase\.md/);
  });

  it('behaviour skill includes design constraints signal phrase', () => {
    const content = readFileSync(BEHAVIOUR_SKILL_PATH, 'utf-8');
    expect(content).toMatch(/design constraints session|UX guidelines.*design principles/i);
  });

  it('ineed skill routes structured constraints to /tr-define-truth', () => {
    const content = readFileSync(INEED_SKILL_PATH, 'utf-8');
    expect(content).toMatch(/tr-define-truth/);
  });
});

describe('design-constraints spec', () => {
  it('usecase.md exists and is deprecated', () => {
    expect(existsSync(SPEC_PATH)).toBe(true);
    const content = readFileSync(SPEC_PATH, 'utf-8');
    expect(content).toMatch(/\*\*State:\*\* deprecated/);
  });

  it('usecase.md sub-behaviours list all four formats', () => {
    const content = readFileSync(SPEC_PATH, 'utf-8');
    expect(content).toMatch(/record-decision/);
    expect(content).toMatch(/define-principle/);
    expect(content).toMatch(/define-convention/);
    expect(content).toMatch(/record-external-constraint/);
  });
});
