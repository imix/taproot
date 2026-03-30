import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const SKILLS_DIR = resolve(__dirname, '../../skills');
const skill = readFileSync(resolve(SKILLS_DIR, 'plan-execute.md'), 'utf-8');

describe('plan-execute skill — required sections', () => {
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

describe('plan-execute skill — no-plan guard (AC-6)', () => {
  it('checks for plan.md before executing', () => {
    expect(skill).toMatch(/plan\.md.*does not exist|No plan found/i);
  });

  it('suggests /tr-plan when plan is missing', () => {
    expect(skill).toMatch(/tr-plan/);
  });
});

describe('plan-execute skill — mode detection (AC-1, AC-4)', () => {
  it('supports step-by-step mode (default)', () => {
    expect(skill).toMatch(/step-by-step/i);
  });

  it('supports batch mode', () => {
    expect(skill).toMatch(/batch/i);
  });

  it('supports specify mode (spec + refine only)', () => {
    expect(skill).toMatch(/specify/i);
  });

  it('supports implement mode (implement only)', () => {
    expect(skill).toMatch(/implement.*mode|implement.*only/i);
  });
});

describe('plan-execute skill — item presentation and confirmation (AC-1)', () => {
  it('presents each item before invoking its skill', () => {
    expect(skill).toMatch(/\[A\].*Proceed/i);
  });

  it('offers skip option', () => {
    expect(skill).toMatch(/\[S\].*Skip/i);
  });

  it('offers stop/quit option', () => {
    expect(skill).toMatch(/\[Q\].*Stop|\[D\].*Stop/i);
  });
});

describe('plan-execute skill — skill dispatch (AC-2)', () => {
  it('dispatches spec items to /tr-behaviour', () => {
    expect(skill).toMatch(/tr-behaviour/);
  });

  it('dispatches implement items to /tr-implement', () => {
    expect(skill).toMatch(/tr-implement/);
  });

  it('dispatches refine items to /tr-refine', () => {
    expect(skill).toMatch(/tr-refine/);
  });
});

describe('plan-execute skill — status updates (AC-2, AC-3)', () => {
  it('marks completed items as done', () => {
    expect(skill).toMatch(/done/);
  });

  it('marks skipped items as skipped', () => {
    expect(skill).toMatch(/skipped/);
  });

  it('marks blocked items as blocked', () => {
    expect(skill).toMatch(/blocked/);
  });
});

describe('plan-execute skill — batch mode (AC-4, AC-5)', () => {
  it('presents full list and waits for confirmation before batch execution', () => {
    expect(skill).toMatch(/\[A\].*Begin|\[A\].*Confirm/i);
  });

  it('handles blocked item in batch mode by pausing', () => {
    expect(skill).toMatch(/batch.*pause|pause.*batch/i);
  });
});

describe('plan-execute skill — review option (AC-22)', () => {
  it('offers [R] Review spec as first HITL option', () => {
    expect(skill).toMatch(/\[R\].*Review/i);
  });

  it('invokes /tr-browse on [R] and re-presents the item', () => {
    expect(skill).toMatch(/tr-browse/);
    expect(skill).toMatch(/re-present|re.present.*same.*item|same.*prompt/i);
  });
});

describe('plan-execute skill — filter modes (AC-8, AC-9)', () => {
  it('specify mode filters to spec and refine only', () => {
    expect(skill).toMatch(/spec.*refine|refine.*spec/i);
  });

  it('filtered-out items stay pending (not skipped)', () => {
    expect(skill).toMatch(/stay.*pending|remain.*pending/i);
  });

  it('reports specify pass completion with remaining implement items', () => {
    expect(skill).toMatch(/Specify pass complete/i);
  });

  it('reports implement pass completion with remaining spec/refine items', () => {
    expect(skill).toMatch(/Implement pass complete/i);
  });
});
