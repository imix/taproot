import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const PATTERNS_DOC = resolve(__dirname, '../../docs/skill-output-patterns.md');
const REQUIRED_SECTIONS = ['Pattern types', 'Declaration rules', 'Enforcement'];
const REQUIRED_PATTERNS = ['artifact-review', 'confirmation', 'progress', 'next-steps'];

describe('docs/skill-output-patterns.md', () => {
  it('exists', () => {
    expect(existsSync(PATTERNS_DOC)).toBe(true);
  });

  it('is readable and non-empty', () => {
    const content = readFileSync(PATTERNS_DOC, 'utf-8');
    expect(content.trim().length).toBeGreaterThan(200);
  });

  it('contains all required sections', () => {
    const content = readFileSync(PATTERNS_DOC, 'utf-8').toLowerCase();
    for (const section of REQUIRED_SECTIONS) {
      expect(content, `Missing section: ${section}`).toContain(section.toLowerCase());
    }
  });

  it('defines all 4 pattern types', () => {
    const content = readFileSync(PATTERNS_DOC, 'utf-8');
    for (const pattern of REQUIRED_PATTERNS) {
      expect(content, `Missing pattern type: ${pattern}`).toContain(pattern);
    }
  });

  it('documents Claude and Gemini rendering for artifact-review', () => {
    const content = readFileSync(PATTERNS_DOC, 'utf-8');
    expect(content).toContain('Claude');
    expect(content).toContain('Gemini');
  });
});
