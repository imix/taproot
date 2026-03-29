import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';

const ROOT = resolve(__dirname, '../..');
const PATTERNS_PATH = join(ROOT, 'docs/patterns.md');
const BEHAVIOUR_SKILL_PATH = join(ROOT, 'skills/behaviour.md');
const SPEC_PATH = join(ROOT, 'taproot/specs/requirements-hierarchy/incremental-behaviour-implementation/usecase.md');

describe('incremental behaviour delivery pattern', () => {
  it('docs/patterns.md contains the incremental behaviour delivery pattern', () => {
    const content = readFileSync(PATTERNS_PATH, 'utf-8');
    expect(content).toMatch(/[Ii]ncremental behaviour delivery/);
  });

  it('docs/patterns.md includes Pattern A (sub-behaviour decomposition)', () => {
    const content = readFileSync(PATTERNS_PATH, 'utf-8');
    expect(content).toMatch(/[Pp]attern A/);
    expect(content).toMatch(/sub-behavio/);
  });

  it('docs/patterns.md includes Pattern B (AC-scoped impl)', () => {
    const content = readFileSync(PATTERNS_PATH, 'utf-8');
    expect(content).toMatch(/[Pp]attern B/);
    expect(content).toMatch(/AC-scoped/i);
  });

  it('docs/patterns.md includes phased-delivery signal phrases', () => {
    const content = readFileSync(PATTERNS_PATH, 'utf-8');
    expect(content).toMatch(/start with|implement part of|defer some ACs/i);
  });

  it('docs/patterns.md links to the usecase.md spec', () => {
    const content = readFileSync(PATTERNS_PATH, 'utf-8');
    expect(content).toMatch(/incremental-behaviour-implementation\/usecase\.md/);
  });

  it('behaviour skill pattern-check step includes phased-delivery signal', () => {
    const content = readFileSync(BEHAVIOUR_SKILL_PATH, 'utf-8');
    expect(content).toMatch(/start with.*implement part of|defer some ACs|MVP of this behaviour/i);
  });

  it('usecase.md spec exists and is specified or beyond', () => {
    expect(existsSync(SPEC_PATH)).toBe(true);
    const content = readFileSync(SPEC_PATH, 'utf-8');
    expect(content).toMatch(/\*\*State:\*\* (specified|implemented|tested)/);
  });

  it('usecase.md contains Pattern A and Pattern B guidance', () => {
    const content = readFileSync(SPEC_PATH, 'utf-8');
    expect(content).toMatch(/Pattern A/);
    expect(content).toMatch(/Pattern B/);
  });
});
