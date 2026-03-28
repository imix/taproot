import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join, resolve } from 'path';

const ROOT = resolve(__dirname, '../..');
const readme = readFileSync(join(ROOT, 'README.md'), 'utf-8');

// AC-1 through AC-5: README.md contains the Concepts section with all five taproot terms
describe('concepts section in README', () => {
  it('README contains a ## Concepts section', () => {
    expect(readme).toMatch(/^## Concepts/m);
  });

  it('defines "intent"', () => {
    const conceptsIdx = readme.indexOf('## Concepts');
    const nextH2 = readme.indexOf('\n## ', conceptsIdx + 1);
    const section = nextH2 === -1 ? readme.slice(conceptsIdx) : readme.slice(conceptsIdx, nextH2);
    expect(section.toLowerCase()).toContain('intent');
  });

  it('defines "behaviour"', () => {
    const conceptsIdx = readme.indexOf('## Concepts');
    const nextH2 = readme.indexOf('\n## ', conceptsIdx + 1);
    const section = nextH2 === -1 ? readme.slice(conceptsIdx) : readme.slice(conceptsIdx, nextH2);
    expect(section.toLowerCase()).toContain('behaviour');
  });

  it('defines "implementation"', () => {
    const conceptsIdx = readme.indexOf('## Concepts');
    const nextH2 = readme.indexOf('\n## ', conceptsIdx + 1);
    const section = nextH2 === -1 ? readme.slice(conceptsIdx) : readme.slice(conceptsIdx, nextH2);
    expect(section.toLowerCase()).toContain('implementation');
  });

  it('defines "global truth"', () => {
    const conceptsIdx = readme.indexOf('## Concepts');
    const nextH2 = readme.indexOf('\n## ', conceptsIdx + 1);
    const section = nextH2 === -1 ? readme.slice(conceptsIdx) : readme.slice(conceptsIdx, nextH2);
    expect(section.toLowerCase()).toContain('global truth');
  });

  it('defines "backlog"', () => {
    const conceptsIdx = readme.indexOf('## Concepts');
    const nextH2 = readme.indexOf('\n## ', conceptsIdx + 1);
    const section = nextH2 === -1 ? readme.slice(conceptsIdx) : readme.slice(conceptsIdx, nextH2);
    expect(section.toLowerCase()).toContain('backlog');
  });
});
