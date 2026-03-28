import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const SKILLS_DIR = resolve(__dirname, '../../skills');
const skill = readFileSync(resolve(SKILLS_DIR, 'plan-build.md'), 'utf-8');

describe('plan-build skill — required sections', () => {
  it('has a Description', () => {
    expect(skill).toMatch(/## Description/);
  });

  it('has a Steps section', () => {
    expect(skill).toMatch(/## Steps/);
  });

  it('has an Output section', () => {
    expect(skill).toMatch(/## Output/);
  });

  it('has a What\'s next block', () => {
    expect(skill).toMatch(/What.s next/i);
  });
});

describe('plan-build skill — source scanning (AC-1, AC-2)', () => {
  it('covers backlog source', () => {
    expect(skill).toMatch(/backlog/i);
  });

  it('covers hierarchy source via taproot coverage', () => {
    expect(skill).toMatch(/coverage/i);
  });

  it('covers explicit items source', () => {
    expect(skill).toMatch(/explicit/i);
  });
});

describe('plan-build skill — item classification (AC-3)', () => {
  it('classifies items as spec', () => {
    expect(skill).toMatch(/\[spec\]/);
  });

  it('classifies items as implement', () => {
    expect(skill).toMatch(/\[implement\]/);
  });

  it('classifies items as refine', () => {
    expect(skill).toMatch(/\[refine\]/);
  });
});

describe('plan-build skill — plan.md format', () => {
  it('documents pending status', () => {
    expect(skill).toMatch(/pending/);
  });

  it('documents done status', () => {
    expect(skill).toMatch(/done/);
  });

  it('documents skipped status', () => {
    expect(skill).toMatch(/skipped/);
  });

  it('documents blocked status', () => {
    expect(skill).toMatch(/blocked/);
  });

  it('documents stale status', () => {
    expect(skill).toMatch(/stale/);
  });
});

describe('plan-build skill — hitl/afk classification (AC-9)', () => {
  it('classifies items as hitl', () => {
    expect(skill).toMatch(/hitl/);
  });

  it('classifies items as afk', () => {
    expect(skill).toMatch(/afk/);
  });

  it('defines hitl as human-in-the-loop', () => {
    expect(skill).toMatch(/human-in-the-loop|human.*decision/i);
  });

  it('defines afk as away-from-keyboard or autonomous', () => {
    expect(skill).toMatch(/away-from-keyboard|autonomously/i);
  });

  it('includes hitl/afk legend in plan.md format', () => {
    expect(skill).toMatch(/HITL.*human.*AFK.*agent|HITL = human/i);
  });

  it('shows hitl/afk labels in proposed plan preview', () => {
    expect(skill).toMatch(/hitl\s+\[spec\]|afk\s+\[implement\]/);
  });
});

describe('plan-build skill — backlog removal (AC-8)', () => {
  it('removes consumed backlog items from taproot/backlog.md', () => {
    expect(skill).toMatch(/[Rr]emov.*backlog|backlog.*[Rr]emov/);
  });

  it('reports how many backlog items were removed', () => {
    expect(skill).toMatch(/Removed.*item.*backlog/i);
  });

  it('skips removal when no backlog items were used', () => {
    expect(skill).toMatch(/[Ss]kip.*step|no backlog items/i);
  });
});

describe('plan-build skill — confirmation flows (AC-4, AC-5, AC-6, AC-7)', () => {
  it('presents plan before writing (pause-and-confirm)', () => {
    expect(skill).toMatch(/\[A\].*Confirm|\[A\].*Append/i);
  });

  it('supports abort without writing files', () => {
    expect(skill).toMatch(/\[Q\].*Abort|\[Q\]\s*stop/i);
  });

  it('handles existing plan with append option', () => {
    expect(skill).toMatch(/Append/i);
  });

  it('handles existing plan with replace option', () => {
    expect(skill).toMatch(/Replace/i);
  });
});
