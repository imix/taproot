import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const SKILLS_DIR = resolve(__dirname, '../../skills');

const read = (name: string) => readFileSync(resolve(SKILLS_DIR, name), 'utf-8');

// ─── AC-1: intent-scoped truth applied in all four authoring skills ────────────

describe('AC-1 — truth-loading step present in all authoring skills', () => {
  it('intent.md loads applicable truths before drafting', () => {
    const skill = read('intent.md');
    expect(skill).toMatch(/Load applicable truths/i);
  });

  it('behaviour.md loads applicable truths before specifying', () => {
    const skill = read('behaviour.md');
    expect(skill).toMatch(/Load applicable truths/i);
  });

  it('implement.md loads applicable truths before planning', () => {
    const skill = read('implement.md');
    expect(skill).toMatch(/Load applicable truths/i);
  });

  it('refine.md loads applicable truths before drafting changes', () => {
    const skill = read('refine.md');
    expect(skill).toMatch(/Load applicable truths/i);
  });
});

// ─── AC-2: scope filtering — only applicable truths loaded per level ──────────

describe('AC-2 — scope filtering rules present in authoring skills', () => {
  it('behaviour.md excludes impl-scoped truths', () => {
    const skill = read('behaviour.md');
    // Must mention impl scope is excluded
    expect(skill).toMatch(/_impl|impl\//);
    expect(skill).toMatch(/Do not include|not.*impl|impl.*only/i);
  });

  it('intent.md includes only intent-scoped truths', () => {
    const skill = read('intent.md');
    expect(skill).toMatch(/_intent/);
    // Should not mention _behaviour or _impl scopes as included at intent level
    expect(skill).not.toMatch(/_behaviour.*suffix.*Include|Include.*_behaviour/);
  });

  it('implement.md includes all three scope levels', () => {
    const skill = read('implement.md');
    expect(skill).toMatch(/_intent/);
    expect(skill).toMatch(/_behaviour/);
    expect(skill).toMatch(/_impl/);
  });

  it('refine.md includes intent and behaviour scopes (behaviour level)', () => {
    const skill = read('refine.md');
    expect(skill).toMatch(/_intent/);
    expect(skill).toMatch(/_behaviour/);
  });
});

// ─── AC-3: contradiction detection present in all four skills ─────────────────

describe('AC-3 — contradiction detection in all authoring skills', () => {
  const CONFLICT_PATTERN = /conflicts with|contradict/i;

  it('intent.md surfaces truth conflicts before writing', () => {
    expect(read('intent.md')).toMatch(CONFLICT_PATTERN);
  });

  it('behaviour.md surfaces truth conflicts before saving', () => {
    expect(read('behaviour.md')).toMatch(CONFLICT_PATTERN);
  });

  it('implement.md surfaces truth conflicts before proceeding', () => {
    expect(read('implement.md')).toMatch(CONFLICT_PATTERN);
  });

  it('refine.md surfaces truth conflicts before writing', () => {
    expect(read('refine.md')).toMatch(CONFLICT_PATTERN);
  });

  it('conflict resolution offers A/B/C options in all skills', () => {
    for (const skillName of ['intent.md', 'behaviour.md', 'implement.md', 'refine.md']) {
      const skill = read(skillName);
      expect(skill, `${skillName} missing conflict resolution options`).toMatch(/\[A\].*align|\[A\].*spec|\[A\].*update/i);
      expect(skill, `${skillName} missing [B] update truth option`).toMatch(/\[B\].*truth/i);
      expect(skill, `${skillName} missing [C] proceed option`).toMatch(/\[C\].*proceed/i);
    }
  });
});

// ─── AC-4: no truths — authoring proceeds normally ────────────────────────────

describe('AC-4 — no truths: authoring proceeds normally', () => {
  it('intent.md truth step is conditional on global-truths/ existing', () => {
    expect(read('intent.md')).toMatch(/global-truths\/.*exists|If.*global-truths/i);
  });

  it('behaviour.md truth step is conditional on global-truths/ existing', () => {
    expect(read('behaviour.md')).toMatch(/global-truths\/.*exists|If.*global-truths/i);
  });

  it('implement.md truth step is conditional on global-truths/ existing', () => {
    expect(read('implement.md')).toMatch(/global-truths\/.*exists|If.*global-truths/i);
  });

  it('refine.md truth step is conditional on global-truths/ existing', () => {
    expect(read('refine.md')).toMatch(/global-truths\/.*exists|If.*global-truths/i);
  });
});

// ─── AC-5: unscoped file treated as intent-scoped with note ──────────────────

describe('AC-5 — unscoped file treated as intent-scoped with inline note', () => {
  const UNSCOPED_PATTERN = /no scope signal|no explicit scope|intent-scoped.*no explicit|treat.*intent-scoped/i;

  it('intent.md notes unscoped files as intent-scoped', () => {
    expect(read('intent.md')).toMatch(UNSCOPED_PATTERN);
  });

  it('behaviour.md notes unscoped files as intent-scoped', () => {
    expect(read('behaviour.md')).toMatch(UNSCOPED_PATTERN);
  });

  it('implement.md notes unscoped files as intent-scoped', () => {
    expect(read('implement.md')).toMatch(UNSCOPED_PATTERN);
  });

  it('refine.md notes unscoped files as intent-scoped', () => {
    expect(read('refine.md')).toMatch(UNSCOPED_PATTERN);
  });
});

// ─── Placement: truth step occurs before first drafting action ────────────────

describe('placement — truth-loading step precedes first draft action', () => {
  it('intent.md truth step appears before "Draft the intent.md content"', () => {
    const skill = read('intent.md');
    const truthIdx = skill.indexOf('Load applicable truths');
    const draftIdx = skill.indexOf('Draft the `intent.md` content');
    expect(truthIdx).toBeGreaterThan(-1);
    expect(draftIdx).toBeGreaterThan(-1);
    expect(truthIdx).toBeLessThan(draftIdx);
  });

  it('behaviour.md truth step appears before sibling scan', () => {
    const skill = read('behaviour.md');
    const truthIdx = skill.indexOf('Load applicable truths');
    const siblingIdx = skill.indexOf('Read all sibling');
    expect(truthIdx).toBeGreaterThan(-1);
    expect(siblingIdx).toBeGreaterThan(-1);
    expect(truthIdx).toBeLessThan(siblingIdx);
  });

  it('implement.md truth step appears before pattern check + plan', () => {
    const skill = read('implement.md');
    const truthIdx = skill.indexOf('Load applicable truths');
    const planIdx = skill.indexOf('Pattern check + plan mode');
    expect(truthIdx).toBeGreaterThan(-1);
    expect(planIdx).toBeGreaterThan(-1);
    expect(truthIdx).toBeLessThan(planIdx);
  });

  it('refine.md truth step appears before drafting changes', () => {
    const skill = read('refine.md');
    const truthIdx = skill.indexOf('Load applicable truths');
    const draftIdx = skill.indexOf('Draft the changes to');
    expect(truthIdx).toBeGreaterThan(-1);
    expect(draftIdx).toBeGreaterThan(-1);
    expect(truthIdx).toBeLessThan(draftIdx);
  });
});

// ─── Enforcement awareness: truths are live commit constraints ────────────────

describe('Enforcement awareness — truths enforced at commit time', () => {
  it('behaviour.md truth step mentions commit-time enforcement', () => {
    const skill = read('behaviour.md');
    expect(skill).toMatch(/enforced at commit time/i);
  });

  it('implement.md truth step mentions commit-time enforcement', () => {
    const skill = read('implement.md');
    expect(skill).toMatch(/enforced at commit time/i);
  });

  it('docs/patterns.md contains "Global truths are live commit constraints" pattern', () => {
    const patterns = readFileSync(resolve(__dirname, '../../docs/patterns.md'), 'utf-8');
    expect(patterns).toMatch(/Global truths are live commit constraints/i);
  });

  it('docs/patterns.md live-constraints pattern references enforce-truths-at-commit spec', () => {
    const patterns = readFileSync(resolve(__dirname, '../../docs/patterns.md'), 'utf-8');
    expect(patterns).toMatch(/enforce-truths-at-commit\/usecase\.md/);
  });

  it('docs/patterns.md live-constraints pattern mentions taproot truth-sign', () => {
    const patterns = readFileSync(resolve(__dirname, '../../docs/patterns.md'), 'utf-8');
    expect(patterns).toMatch(/truth-sign/);
  });
});
