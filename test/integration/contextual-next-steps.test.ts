import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const SKILLS_DIR = resolve(__dirname, '../../skills');

const LEAF_SKILLS = [
  'intent.md',
  'behaviour.md',
  'implement.md',
  'refine.md',
  'review.md',
  'review-all.md',
  'status.md',
  'discover.md',
  'discover-truths.md',
  'analyse-change.md',
  'promote.md',
  'grill-me.md',
  'decompose.md',
  'trace.md',
  'guide.md',
];

// Router skills that have inline guidance at terminal sub-paths
const ROUTER_SKILLS_WITH_INLINE_GUIDANCE = [
  'ineed.md',
  'plan.md',
];

const NEXT_STEP_PATTERN = /\*\*Next:\*\*|\*\*What'?s next\??\*\*|Nothing obvious next/i;

describe('contextual-next-steps — leaf skills have next-step guidance', () => {
  for (const skillFile of LEAF_SKILLS) {
    it(`${skillFile} contains next-step guidance`, () => {
      const content = readFileSync(resolve(SKILLS_DIR, skillFile), 'utf-8');
      expect(NEXT_STEP_PATTERN.test(content)).toBe(true);
    });
  }
});

describe('contextual-next-steps — router skills have inline guidance at terminal paths', () => {
  for (const skillFile of ROUTER_SKILLS_WITH_INLINE_GUIDANCE) {
    it(`${skillFile} contains inline next-step guidance`, () => {
      const content = readFileSync(resolve(SKILLS_DIR, skillFile), 'utf-8');
      expect(NEXT_STEP_PATTERN.test(content)).toBe(true);
    });
  }
});

describe('contextual-next-steps — guidance format references correct commands', () => {
  it('behaviour.md guidance references /tr-implement and /tr-review', () => {
    const content = readFileSync(resolve(SKILLS_DIR, 'behaviour.md'), 'utf-8');
    expect(content).toContain('/tr-implement');
    expect(content).toContain('/tr-review');
  });

  it('implement.md guidance references /tr-plan', () => {
    const content = readFileSync(resolve(SKILLS_DIR, 'implement.md'), 'utf-8');
    expect(content).toContain('/tr-plan');
  });

  it('review.md guidance references /tr-refine and /tr-implement', () => {
    const content = readFileSync(resolve(SKILLS_DIR, 'review.md'), 'utf-8');
    expect(content).toContain('/tr-refine');
    expect(content).toContain('/tr-implement');
  });

  it('guide.md guidance uses optional framing', () => {
    const content = readFileSync(resolve(SKILLS_DIR, 'guide.md'), 'utf-8');
    expect(content).toMatch(/Nothing obvious next|whenever you'?re ready/i);
  });
});
