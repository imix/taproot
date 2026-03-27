import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const SKILLS_DIR = resolve(__dirname, '../../skills');
const skill = readFileSync(resolve(SKILLS_DIR, 'plan-analyse.md'), 'utf-8');

describe('plan-analyse skill — required sections', () => {
  it('has a Description', () => {
    expect(skill).toMatch(/## Description/);
  });

  it('has a Steps section', () => {
    expect(skill).toMatch(/## Steps/);
  });

  it('has an Output section', () => {
    expect(skill).toMatch(/## Output/);
  });

  it('has a CLI Dependencies section', () => {
    expect(skill).toMatch(/## CLI Dependencies/);
  });

  it('has a What\'s next block', () => {
    expect(skill).toMatch(/What.s next/i);
  });
});

describe('plan-analyse skill — no-plan guard (AC-7)', () => {
  it('checks for plan.md before analysing', () => {
    expect(skill).toMatch(/plan\.md.*does not exist|No plan found/i);
  });

  it('suggests /tr-plan-build when plan is missing', () => {
    expect(skill).toMatch(/tr-plan-build/);
  });
});

describe('plan-analyse skill — readiness checks (AC-1, AC-2, AC-3, AC-4)', () => {
  it('evaluates spec items for description clarity', () => {
    expect(skill).toMatch(/\[spec\]/);
  });

  it('evaluates implement items for usecase.md state', () => {
    expect(skill).toMatch(/\[implement\]/);
  });

  it('flags proposed/draft specs as needs-attention', () => {
    expect(skill).toMatch(/proposed|draft/i);
  });

  it('evaluates refine items', () => {
    expect(skill).toMatch(/\[refine\]/);
  });

  it('checks dependency predecessors', () => {
    expect(skill).toMatch(/depend|predecessor/i);
  });
});

describe('plan-analyse skill — report format (AC-1, AC-2, AC-4)', () => {
  it('includes a Ready section', () => {
    expect(skill).toMatch(/✓ Ready/);
  });

  it('includes a Needs Attention section', () => {
    expect(skill).toMatch(/⚠ Needs attention/i);
  });

  it('includes a Blocked section', () => {
    expect(skill).toMatch(/✗ Blocked/);
  });
});

describe('plan-analyse skill — all-ready path (AC-5)', () => {
  it('offers execute shortcut when all items are ready', () => {
    expect(skill).toMatch(/tr-plan-execute/);
  });
});

describe('plan-analyse skill — read-only guarantee', () => {
  it('states no files are modified', () => {
    expect(skill).toMatch(/read-only|no files modified|never modif/i);
  });
});
