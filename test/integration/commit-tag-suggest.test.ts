import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const SKILLS_DIR = resolve(__dirname, '../../skills');
const commitSkill = readFileSync(resolve(SKILLS_DIR, 'commit.md'), 'utf-8');

// AC-1: Tag derived from single impl path — skill must describe extracting path segments from impl.md path
describe('suggest-commit-tag — skill content (AC-1)', () => {
  it('describes deriving tag from taproot/specs/<intent>/<behaviour>/<impl>/impl.md path', () => {
    expect(commitSkill).toContain('taproot/specs/');
    expect(commitSkill).toContain('<intent>/<behaviour>/<impl>');
  });

  it('shows the taproot(<path>): prefix format', () => {
    expect(commitSkill).toMatch(/taproot\(<intent>\/<behaviour>\/<impl>\):/);
  });
});

// AC-2: Tag collapsed to behaviour level for multiple impls under same behaviour
describe('suggest-commit-tag — collapse to behaviour level (AC-2)', () => {
  it('describes collapsing to behaviour level when multiple impls share same intent/behaviour prefix', () => {
    expect(commitSkill).toMatch(/same.*intent.*behaviour|behaviour.*level/i);
    expect(commitSkill).toContain('taproot(<intent>/<behaviour>):');
  });
});

// AC-3: Developer-supplied tag is preserved
describe('suggest-commit-tag — preserve developer-supplied tag (AC-3)', () => {
  it('describes skipping suggestion when developer already supplied a tag', () => {
    expect(commitSkill).toMatch(/already supplied|starts with|as-is/i);
    expect(commitSkill).toContain('taproot(');
    expect(commitSkill).toMatch(/fix:|feat:|chore:/);
  });
});

// AC-4: Multi-intent staged files trigger split offer
describe('suggest-commit-tag — multi-intent conflict (AC-4)', () => {
  it('describes reporting conflict when staged files span multiple behaviours', () => {
    expect(commitSkill).toMatch(/span.*multiple behaviours|multiple.*behaviours/i);
  });

  it('offers split option for multi-behaviour commits', () => {
    expect(commitSkill).toMatch(/\[B\].*[Ss]plit/);
  });
});

// AC-5: No tag suggested for plain commit — already implied by plain commit sub-flow,
// but the suggestion step is only in the Implementation commit sub-flow
describe('suggest-commit-tag — tag suggestion scoped to implementation commits (AC-5)', () => {
  it('Suggest commit tag step appears only in the Implementation commit sub-flow', () => {
    const implFlowStart = commitSkill.indexOf('### Implementation commit');
    const declFlowStart = commitSkill.indexOf('### Declaration commit');
    const tagSuggestionIdx = commitSkill.indexOf('Suggest commit tag');

    expect(tagSuggestionIdx).toBeGreaterThan(implFlowStart);
    expect(tagSuggestionIdx).toBeLessThan(declFlowStart);
  });
});

// Structural: both skills/commit.md and taproot/agent/skills/commit.md must be in sync
describe('suggest-commit-tag — skills sync', () => {
  it('skills/commit.md and taproot/agent/skills/commit.md are identical', () => {
    const agentSkill = readFileSync(
      resolve(__dirname, '../../taproot/agent/skills/commit.md'),
      'utf-8'
    );
    expect(commitSkill).toBe(agentSkill);
  });
});
