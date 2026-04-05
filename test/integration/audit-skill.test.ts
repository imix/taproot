import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, it, expect } from 'vitest';

const SKILLS_DIR = resolve(__dirname, '../../skills');

describe('audit skill — interactive walkthrough', () => {
  const content = readFileSync(resolve(SKILLS_DIR, 'audit.md'), 'utf-8');

  it('presents findings one at a time, not as a batch', () => {
    expect(content).toContain('present findings one at a time');
    expect(content).toContain('Interactive walkthrough');
  });

  it('requires a proposed fix per finding', () => {
    expect(content).toContain('proposed fix');
    expect(content).toContain('specific wording change, addition, or removal');
    expect(content).toContain('proposed fix per finding is **not optional**');
  });

  it('includes triage prompt with correct letter keys', () => {
    expect(content).toContain('[A] Accept');
    expect(content).toContain('[X] Dismiss');
    expect(content).toContain('[E] Edit');
    expect(content).toContain('[L] Later');
  });

  it('includes agent recommendation per finding', () => {
    expect(content).toContain('recommended action');
    expect(content).toContain('Recommendation:');
  });

  it('supports batch escape to apply remaining recommendations', () => {
    expect(content).toContain('"go"');
    expect(content).toContain('"apply remaining"');
    expect(content).toContain("agent's recommended action for each remaining finding");
  });

  it('shows triage summary after all findings processed', () => {
    expect(content).toContain('Triage complete');
    expect(content).toContain('accepted');
    expect(content).toContain('dismissed');
    expect(content).toContain('deferred');
  });

  it('passes only accepted findings to refine', () => {
    expect(content).toContain('only the accepted findings with their proposed fixes');
    expect(content).toContain('Dismissed findings are not passed');
  });

  it('handles intents without parent context', () => {
    expect(content).toContain('Intents have no parent');
  });

  it('detects placeholder artifacts', () => {
    expect(content).toContain('placeholder or stub');
    expect(content).toContain('Write the spec first, then audit');
  });
});
