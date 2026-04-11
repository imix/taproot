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

  it('offers later (defer) option', () => {
    expect(skill).toMatch(/\[L\].*Later/i);
  });

  it('offers drop option', () => {
    expect(skill).toMatch(/\[X\].*Drop/i);
  });

  it('offers cancel option', () => {
    expect(skill).toMatch(/\[C\].*Cancel/i);
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

  it('marks deferred items as deferred', () => {
    expect(skill).toMatch(/deferred/);
  });

  it('marks dropped items as dropped', () => {
    expect(skill).toMatch(/dropped/);
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

describe('plan-execute skill — review option (AC-22, AC-23)', () => {
  it('offers [R] Review spec as first HITL option', () => {
    expect(skill).toMatch(/\[R\].*Review/i);
  });

  it('invokes /tr-browse on [R] and re-presents the item', () => {
    expect(skill).toMatch(/tr-browse/);
    expect(skill).toMatch(/re-present|re.present.*same.*item|same.*prompt/i);
  });

  it('lets browse run to full completion before re-presenting (AC-23)', () => {
    expect(skill).toMatch(/full completion|fully.*exit|fully completed/i);
  });
});

describe('plan-execute skill — execution style per mode', () => {
  it('HITL mode is always step-by-step', () => {
    expect(skill).toMatch(/HITL.*always step-by-step|HITL.*always.*step.by.step/i);
  });

  it('AFK mode is always batch (no per-item prompt)', () => {
    expect(skill).toMatch(/AFK.*always batch|AFK.*always.*batch/i);
  });

  it('batch mode pauses on hitl items', () => {
    expect(skill).toMatch(/[Bb]atch.*paus.*hitl|hitl.*paus.*batch/i);
  });
});

describe('plan-execute skill — filter modes (AC-8, AC-9)', () => {
  it('specify mode filters to spec and refine only', () => {
    expect(skill).toMatch(/spec.*refine|refine.*spec/i);
  });

  it('filtered-out items stay pending (not deferred)', () => {
    expect(skill).toMatch(/stay.*pending|remain.*pending/i);
  });

  it('reports specify pass completion with remaining implement items', () => {
    expect(skill).toMatch(/Specify pass complete/i);
  });

  it('reports implement pass completion with remaining spec/refine items', () => {
    expect(skill).toMatch(/Implement pass complete/i);
  });
});

describe('plan-execute skill — follow-on offer after spec/refine (AC-11)', () => {
  it('offers [+] Add follow-on to plan after spec or refine item completes', () => {
    expect(skill).toMatch(/\[\+\]\s*Add follow-on to plan/i);
  });

  it('follow-on offer is conditional on item type (spec or refine)', () => {
    expect(skill).toMatch(/type.*\[spec\].*or.*\[refine\]|spec.*refine.*follow.on/i);
  });

  it('guards follow-on offer: only if no implement item for same path exists', () => {
    expect(skill).toMatch(/no.*\[implement\].*item.*same path|implement.*already exists/i);
  });

  it('appends implement afk item when [+] is selected', () => {
    expect(skill).toMatch(/implement afk.*path|Added.*\[implement\] afk/i);
  });
});
